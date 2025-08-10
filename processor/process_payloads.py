# processor/process_payloads.py
import os, json, glob
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../backend/.env'))

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['whatsapp']
collection = db['processed_messages']

PAYLOAD_DIR = os.path.join(os.path.dirname(__file__), '../payloads')  # adjust if needed

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        payload = json.load(f)
    entry = payload.get('metaData', {}).get('entry', [None])[0]
    if not entry: return
    change = entry.get('changes', [None])[0]
    if not change: return
    value = change.get('value', {})

    # messages
    if value.get('messages') and value.get('contacts'):
        contact = value['contacts'][0]
        message = value['messages'][0]
        doc = {
            "wa_id": contact.get('wa_id'),
            "name": contact.get('profile', {}).get('name'),
            "number": contact.get('wa_id'),
            "message_id": message.get('id'),
            "direction": 'inbound' if message.get('from') == contact.get('wa_id') else 'outbound',
            "type": message.get('type'),
            "text": message.get('text', {}).get('body'),
            "status": 'sent',
            "timestamp": datetime.fromtimestamp(int(message.get('timestamp'))),
            "raw_payload": payload
        }
        collection.update_one({"message_id": doc["message_id"]}, {"$setOnInsert": doc}, upsert=True)
        print(f"Processed message {doc['message_id']} from {doc['wa_id']}")

    # statuses
    if value.get('statuses'):
        for s in value['statuses']:
            id_to_find = s.get('id') or s.get('meta_msg_id')
            if id_to_find:
                collection.update_many({"message_id": id_to_find}, {"$set": {"status": s.get('status')}})
                print(f"Updated status {id_to_find} -> {s.get('status')}")

if __name__ == '__main__':
    files = glob.glob(os.path.join(PAYLOAD_DIR, '*.json'))
    for f in sorted(files):
        process_file(f)
    print("Done processing all payload files.")
