import psycopg2
from psycopg2 import errorcodes, errors
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os


class DBController:
    def __init__(self):
        load_dotenv()

        # get section, default to postgresql
        db = {
            'host': os.getenv('DBHOST'),
            'database': os.getenv('DATABASE'),
            'user': os.getenv('DBUSER'),
            'password': os.getenv('PASSWORD')
        }
        self.params = db
    
    def select(self, query, params=None):
        try:
            with psycopg2.connect(**self.params) as conn:
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(query, params)
                result = cursor.fetchall()
                return {"status_code": 200, "response": result}
        except (errors.DatatypeMismatch, errors.DataError) as e:
            return {"status_code": 400, "response": str(e)}
        except psycopg2.Error as e:
            print("Uncaught error: ", errorcodes.lookup(e.pgcode))
            return {"status_code": 500, "response": str(e)}
        
    def insert(self, query, params, return_columns=None):
        try:
            with psycopg2.connect(**self.params) as conn:
                # modify query to return inserted row if provided
                if return_columns:
                    query = query.rstrip().rstrip(';') + f" RETURNING {return_columns};"
                conn.autocommit = True
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(query, params)
            return {"status_code": 201, "response": "record successfully inserted", "inserted": cursor.fetchone() if return_columns else "No column requested"}
        except errors.UniqueViolation as e:
            return {"status_code": 409, "response": str(e), "inserted": None}
        except (errors.DatatypeMismatch, errors.DataError) as e:
            return {"status_code": 400, "response": str(e), "inserted": None}
        except psycopg2.Error as e:
            print(e)
            print("Uncaught error: ", errorcodes.lookup(e.pgcode))
            return {"status_code": 500, "response": str(e), "inserted": None}

    def update(self, query, params):
        try:
            with psycopg2.connect(**self.params) as conn:
                conn.autocommit = True
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(query, params)
                # Check if any rows were affected by the update
                if cursor.rowcount == 0:
                    # If no rows were affected, the item to update wasn't found
                    return {"status_code": 404, "response": "Not Found"}
                return {"status_code": 200, "response": "Updated"}
        except errors.UniqueViolation as e:
            return {"status_code": 409, "response": str(e), "inserted": None}
        except psycopg2.Error as e:
            print("Uncaught error: ", errorcodes.lookup(e.pgcode))
            return {"status_code": 500, "response": str(e)}
    
    def delete(self, query, params):
        try:
            with psycopg2.connect(**self.params) as conn:
                conn.autocommit = True
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(query, params)
                print(cursor.rowcount)
                if cursor.rowcount == 0:
                    return {"status_code": 404, "response": "record doesn't exist"}
                return {"status_code": 204, "response": "deleted"}
        except (errors.DatatypeMismatch, errors.DataError) as e:
            return {"status_code": 400, "response": str(e), "inserted": None}
        except psycopg2.Error as e:
            print("Uncaught error: ", errorcodes.lookup(e.pgcode))
            return {"status_code": 500, "response": str(e)}