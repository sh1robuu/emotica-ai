from db.database import engine, Base
import db.models
import logging

def init_db():
    logging.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logging.info("Database tables created.")

if __name__ == "__main__":
    init_db()
