"""Simple migration script to create initial tables.

This is intentionally minimal for local/dev use. For production use Alembic
or another structured migration tool should be adopted.
"""
from Backend.Persistence.database import engine
from Backend.Persistence.models import Base


def main():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")


if __name__ == "__main__":
    main()
