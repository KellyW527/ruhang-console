

## Fix: Email Compose Floating, Sidebar Upload, and Task Submission Flow

### Problem Analysis

**1. Email compose bottom bar floating out of layer**
The compose panel uses `absolute inset-0 z-20` with `overflow-y-auto` on the outer container, but the bottom action bar uses `sticky bottom-0`. In this flex layout, the sticky positioning breaks when the content is scrolled — the footer detaches visually.

**2. Sidebar "上传附件" button not responding**
The hidden `<input ref={fileInputRef}>` lives inside the chat tab's conditional block (line 1672). When the email tab is active, that input element is unmounted, so `fileInputRef.current` is `null`. Clicking the sidebar button does nothing.

**3. Task submission not activating feedback or unlocking next task**
Root cause: `activeTask` (line 148) includes tasks with status `"feedback_pending"`, but `triggerSubmission` (line 864) only matches `"active"` or `"needs_resubmission"`. When a task is in `"feedback_pending"` state (e.g., from a prior attempt where feedback dialog was dismissed), `uploadIntoChat` sees an active task and calls `triggerSubmission`, which silently returns without doing anything because it can't find a matching task.

Additionally, per your preference, tasks requiring email submission should reject chat-uploaded attachments and guide the user to use email instead.

---

### Planned Changes (all in `src/pages/Workspace.tsx`)

**Fix 1 — Compose panel layout**
- Restructure the compose panel so the outer `absolute` container is a flex column (not scrollable itself).
- Move `overflow-y-auto` to the form content area only.
- Change the bottom action bar from `sticky bottom-0` to `shrink-0` within the flex column, so it always stays pinned at the bottom without floating.

**Fix 2 — Sidebar upload button**
- Move the hidden `<input ref={fileInputRef}>` and `<input ref={imageInputRef}>` elements **outside** the chat/email tab conditional, so they are always mounted regardless of which tab is active.
- This ensures `fileInputRef.current?.click()` works from the sidebar at all times.

**Fix 3 — Task submission flow**
- In `triggerSubmission`: if no `"active"` or `"needs_resubmission"` task is found, check for a `"feedback_pending"` task and re-open the feedback dialog instead of silently returning.
- In `uploadIntoChat`: before calling `triggerSubmission`, check the current task's `expectedSubmissionKind` from `getTaskRuntime()`. If the task requires `"email"` submission, show a toast directing the user to submit via email instead, and skip the submission call.
- This matches your preference to keep email-only tasks strictly email-based.

