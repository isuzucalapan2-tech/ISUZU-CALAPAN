# SA_Rotation Theme & UI/UX Update

## Plan
Match SA_Rotation theme to system's neutral/red palette, improve UI/UX, eliminate scrollbar triggers.

## Tasks

### Theme Migration (slate → neutral, indigo/purple → neutral-900/red-600)
- [ ] Root div: `w-screen bg-slate-100` → `w-full bg-neutral-100`
- [ ] Header: border, title typography (add red accent bar + isuzu-font)
- [ ] Auto Assign card: border, gradient header → `bg-neutral-900`
- [ ] Auto Assign: select, textarea, labels, manual override button
- [ ] Auto Assign: auto-assigned display (indigo → neutral)
- [ ] Auto Assign: SA selection buttons (indigo → neutral-900)
- [ ] Auto Assign: footer/clear button (slate → neutral)
- [ ] Active Orders card: border, header, search input
- [ ] Active Orders: table headers, body, row hover (indigo → neutral)
- [ ] Active Orders: action buttons (indigo → neutral), pagination
- [ ] Switchable card: border, toggle tabs (indigo → neutral-900)
- [ ] Advisors view: gradient header → `bg-neutral-900`, stats panel
- [ ] Advisors view: SA list items, workload bar, tooltip, dropdown
- [ ] Advisors view: add form input/button (indigo → neutral-900)
- [ ] Orders view: gradient header → `bg-neutral-900`, PR items
- [ ] Orders view: dropdown, add form (indigo → neutral-900)
- [ ] History card: border, header, date inputs, search, select
- [ ] History card: table, pagination
- [ ] Edit Assignment modal: gradient header → `bg-neutral-900`, save button
- [ ] Edit PR modal: gradient header → `bg-neutral-900`, save button
- [ ] Edit SA modal: gradient header → `bg-neutral-900`, save button
- [ ] Delete modals: cancel/footer (slate → neutral)
- [ ] Style section: scrollbar colors (slate → neutral)

### UI/UX Improvements
- [ ] Header: add red accent bar, bold uppercase isuzu-font title
- [ ] Card headers: consistent `bg-neutral-900` with `font-black uppercase tracking-widest`
- [ ] Labels: `font-black uppercase tracking-widest text-[9px]`
- [ ] No scrollbar trigger: `w-screen` → `w-full`

## Progress
- [ ] All changes applied
- [ ] Visual verification complete
