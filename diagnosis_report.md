# Diagnosis V2: The White Box Issue (Persistent)

Despite removing the global padding, the "white box" persists. Based on further analysis of the emulator architecture (`.iphone-emulator` with fixed height) and the component styles, here are 15 updated possible reasons:

1.  **Viewport Unit Mismatch (Primary Cause)**: Components use `h-screen` (100vh) or `min-h-screen`. Inside the fixed-height emulator (874px), `100vh` resolves to the *browser window height*. If the browser window is shorter than 874px (e.g., on a laptop), the component cuts off early, revealing the emulator's white background at the bottom.
2.  **`overflow-y: auto` on Container**: The parent `.iphone-screen` handles scrolling. If the child is shorter than the parent (due to Reason #1), the scrollable area is larger than the content, showing the background.
3.  **Flexbox Filling**: The `.iphone-screen` is a flex item. Children should use `h-full` to fill it. Using `h-screen` breaks this contract.
4.  **Absolute Positioning Context**: In `ChargingNavigatorScreen`, `absolute bottom-0` aligns to the bottom of the component. If the component is short (due to `h-screen`), the bottom elements render "mid-screen" relative to the emulator, leaving empty space below.
5.  **Previous Conditional Padding**: If the `showBottomNav` logic is flawed or if `pb-[90px]` interacts poorly with `h-screen` content (e.g. `100vh` + padding), it could create gaps.
6.  **Browser Address Bar Dynamics**: On mobile, `100vh` fluctuates. If the emulator is running in a mobile browser, this causes resizing issues.
7.  **Scale Transform Artifacts**: Scaling the emulator might not perfectly scale `vh` units if they are calculated relative to the unscaled viewport.
8.  **Z-Index Layering**: The emulator background is effectively a layer below the content. Any gap in content reveals it.
9.  **Sticky Positioning**: Elements using `sticky` might be sticking to the wrong viewport edge if the scroll container is not what they expect.
10. **Overscroll Behavior**: If the user pulls up (overscroll), the background shows.
11. **Bottom Sheet Height Logic**: The bottom sheet is `h-[45%]`. 45% of `h-screen` (short) is smaller than 45% of the emulator height.
12. **Map Height Logic**: Similarly, the map is `h-[60%]`. If the container is short, the map is short.
13. **Home Indicator Spacing**: The indicator is an overlay. If content doesn't account for it, it might look visually off, though not a "white box".
14. **Tailwind Preflight defaults**: Default margins/padding on `body` or `html` interfering with `h-screen` calculations.
15. **React Portal Usage**: If modals or overlays were using Portals (unlikely here), they might render outside the emulator flow.

**Conclusion**: The use of `h-screen`/`min-h-screen` is semantically incorrect for an app running inside a simulated frame. Replacing them with `h-full`/`min-h-full` will force components to fill the emulator frame exactly, eliminating the gap.
