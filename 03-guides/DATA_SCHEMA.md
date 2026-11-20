# Data schema notes

- JSON `items[]` is the canonical vocabulary list.
- `phonics.status` is one of: `user_confirmed`, `editorial_correction`, `user_pattern_interpreted`, `pending_native_teacher_review`.
- `phonics.sequence` is ordered and learner-facing. Preserve exact order.
- `audio.*` and `image.*` remain null until real assets are recorded and checked.
- Review fields must not be changed to approved without evidence of review.
- Use stable `id`; never use array index as an ID.
