# Diagnosis: The White Box Issue

Based on the analysis of the codebase (`App.tsx`, `index.css`) and the visual evidence provided, here are 15 possible reasons for the "white box" appearing at the bottom of the screens:

1.  **Global CSS Padding (Primary Cause)**: The `.iphone-screen` class in `index.css` has `padding-bottom: 90px;` applied unconditionally. On screens without the Bottom Nav, this creates a 90px empty space at the bottom of the scrollable area, revealing the container's white/gray background.
2.  **Container Background Color**: The `.iphone-screen` has `background-color: #f8fafc;`. When the content scrolls up (or if the content is shorter than the viewport + padding), this background color is visible in the padded area, appearing as a white box.
3.  **BottomNav Conditional Logic Failure**: Although unlikely given the code inspection, if `showBottomNav` were evaluating to `true` on screens where it should be `false`, the empty white container for the nav bar would render.
4.  **`h-screen` vs. Emulator Height**: Elements using `h-screen` (100vh) might not perfectly match the fixed pixel height of the `.iphone-emulator` (874px), causing background leakage if the content is slightly shorter than the container.
5.  **Fixed/Sticky Positioning Conflicts**: If the "Actions" footer or other elements use sticky positioning without a defined bottom threshold, they might visually clash with the global padding.
6.  **Z-Index Stacking Context**: If the background of the emulator (`z-0`) is white and the content (`z-10`) doesn't cover it fully (due to padding), the "white box" is effectively the bottom layer showing through.
7.  **Relative vs. Absolute Positioning**: Absolute positioned children (like the Map) align to the padding box of the relative parent (`.iphone-screen`). However, `bottom: 0` typically aligns to the border edge, but the padding might still displace "flow" content that interacts with it.
8.  **Flexbox `flex: 1` Behavior**: The `.iphone-screen` is a flex child. If its content doesn't fill the available space (due to the padding reducing the *effective* content height), the background shows.
9.  **Overflow handling**: `overflow-x: hidden` on the container might be clipping content that attempts to extend into the padded area, depending on how the browser handles padding in scroll containers.
10. **Browser Default User Agent Styles**: Unset margins or paddings on `body` or `html` could potentially shift content, though Tailwind usually resets this.
11. **Viewport Unit (`vh`) Inconsistency**: `100vh` in an iframe or nested context acts differently than in a top-level window, potentially leaving gaps.
12. **Home Indicator Interference**: The `.home-indicator` div is absolutely positioned at the bottom. If it had an opaque background (it currently has `opacity: 0.25`), it could look like a box.
13. **Image Loading Failures**: If background images (like the Map) fail to load or don't cover the full area (`background-size: cover`), the white background appears.
14. **Pseudo-elements**: Before/After pseudo-elements on the emulator frame could be mispositioned (though they seem to be for the bezel/buttons).
15. **Scrollbar Gutter**: Even with `scrollbar-width: none`, some rendering engines might reserve space for the scrollbar track, appearing as a blank strip.

**Conclusion**: Reason #1 (Global CSS Padding) is the definitive cause. The padding is structurally enforced on every screen, regardless of whether the visual element it accommodates (the Nav Bar) is present.
