# Home Layout Baseline

Baseline date: May 20, 2026

This file marks the current homepage layout as the fallback version. If later layout work gets messy, return to the commit or tag that includes this note.

## Desktop Contract

The homepage is a fixed-height app surface that fits within `100dvh`.

The visual system is organized as four vertical lanes:

1. Avatar lane
   - Narrow left lane.
   - Holds the primary avatar at the top.
   - Holds contextual avatars aligned beside navigational items.
   - These avatars appear related to the navigation items, but they live in their own lane.

2. Navigation lane
   - Holds identity, tabs, work lists, writing lists, and other navigational controls.
   - Owns the scrollable navigation content.
   - Keeps the music component pinned inside the first viewport with a little bottom padding.

3. Detail lane
   - Independent detail surface.
   - Updates only when explicitly commanded by selection state.
   - Should not be treated as a dependent extension of the navigation lane.

4. Reserved far-right lane
   - Currently empty by design.
   - Keep it available for future information or tooling.

The floating contact control is the highest surfaced homepage item and should sit above scrollbars, previews, and other fixed UI.

## Mobile Contract

Mobile uses two functional lanes:

1. Avatar lane
   - The avatar remains visually distinct from the navigation/detail content.

2. Navigation/detail lane
   - Tabs, lists, and detail views share this lane.
   - The detail view can replace the navigation view when selected.
   - Stacked components, such as the music component, can sit below the primary navigation/detail content.

The mobile layout should preserve the same mental model as desktop while collapsing the visible lanes into a simpler structure.

## Fallback Rule

When future changes introduce layout regressions, recover this version first, then reapply new work deliberately.
