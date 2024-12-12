import psycopg2
from psycopg2 import errorcodes, errors
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()

db = {
    'host': os.getenv('DBHOST'),
    'database': os.getenv('DATABASE'),
    'user': os.getenv('DBUSER'),
    'password': os.getenv('PASSWORD')
}

with psycopg2.connect(**db) as conn:
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("select * from Users")
    print(cursor.fetchall())