ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_puzzle_type_check;
ALTER TABLE gifts ADD CONSTRAINT gifts_puzzle_type_check
  CHECK (puzzle_type IN ('trivia', 'math', 'slide', 'jigsaw', 'multiple_choice'));
