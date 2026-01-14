# empty
from pydantic import BaseSettings

class Settings(BaseSettings):
	# Operational constraints and defaults
	default_shift_hours: int = 8
	max_contiguous_work_hours: int = 6
	scheduling_buffer_minutes: int = 15
	escalation_threshold_seconds: int = 300

settings = Settings()
