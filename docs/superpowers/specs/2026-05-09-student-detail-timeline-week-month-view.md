# Student Detail: Week/Month Timeline View

## Summary

Make the existing 周/月 toggle functional on StudentDetail.vue. Week view shows 7 days centered on today; month view shows a natural month. Users navigate through time by horizontal swipe/scroll with snap points.

## Current State

- `range` ref toggles between '周' and '月' but has no effect
- Timeline always renders all tasks across their full date range
- 4 fixed segments, `min-w-[880px]`

## Target State

### Toggle Behavior

- **周**: 7-day window centered on today. Each day is a column (~120px wide).
- **月**: Natural month (e.g., May 1–31). Days are columns, width adapts to month length.
- Switching resets scroll position to the period containing today.

### Scroll / Swipe Navigation

- Timeline area uses `overflow-x: auto` with `scroll-snap-type: x mandatory`
- Each period (week or month) is a snap page with `scroll-snap-align: start`
- Scrollbar hidden visually; touchpad and touchscreen swipe naturally
- No arrow buttons — pure swipe/scroll

### Timeline Header

- Week: 7 columns labeled "5/4 一", "5/5 二", etc. Today column highlighted.
- Month: N columns (28–31) labeled "5/1", "5/2", ... "5/31". Today highlighted.
- A period label above the header shows the current range (e.g., "5/4 — 5/10" or "2026年5月").

### Task Bars

- Positioned via `left` % and `width` % relative to the current period's day span
- Tasks that start before or end after the period are clipped at the boundary
- "Today" line only rendered when today falls within the visible period
- Same color/dot/swimlane logic as current implementation

### Data

- No API changes needed; works with existing mock `tasks` array
- `timelineLayout` computed ref respects `range` to calculate bounds per-period

## Implementation Outline

1. Add `cursorDate` ref (Date) to track the anchor date for the current view
2. Compute `periods` array: list of consecutive weeks or months surrounding cursorDate
3. Compute `currentPeriodIndex` to know which snap page contains today
4. Update `timelineBounds`, `timelineSegments`, `timelineLayout` to operate per-period
5. Template: iterate periods, render each as a snap page with its own header + swimlane
6. Scroll today's period into view on mount and on toggle switch
7. Style: scroll-snap, hidden scrollbar, column sizing

## Scope

StudentDetail.vue only. No new files. No API changes.
