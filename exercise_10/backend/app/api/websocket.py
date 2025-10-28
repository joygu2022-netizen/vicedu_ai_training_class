from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import asyncio
import json
from datetime import datetime

router = APIRouter(tags=["WebSocket"])

# Active WebSocket connections
active_connections: Dict[str, WebSocket] = {}
audio_queues: Dict[str, asyncio.Queue] = {}

@router.websocket("/ws/call/{call_id}")
async def websocket_call_endpoint(websocket: WebSocket, call_id: str):
    """
    WebSocket endpoint for real-time call handling
    
    Receives:
    - Audio chunks (bytes)
    - Control messages (JSON)
    
    Sends:
    - Transcription updates
    - AI suggestions
    - Status updates
    """
    await websocket.accept()
    active_connections[call_id] = websocket
    audio_queues[call_id] = asyncio.Queue()
    
    print(f"✅ WebSocket connected: {call_id}")
    
    try:
        while True:
            # Receive data from client
            data = await websocket.receive()
            
            if "bytes" in data:
                # Audio data
                audio_chunk = data["bytes"]
                await audio_queues[call_id].put(audio_chunk)
                
                # Forward audio to partner (for real-time audio streaming)
                from .calls import active_calls
                partner_call_id = None
                for active_call_id, call_info in active_calls.items():
                    if call_id == call_info.get("agent_call_id"):
                        partner_call_id = call_info.get("customer_call_id")
                        break
                    elif call_id == call_info.get("customer_call_id"):
                        partner_call_id = call_info.get("agent_call_id")
                        break
                
                # Forward audio to partner if connected
                if partner_call_id and partner_call_id in active_connections:
                    try:
                        await active_connections[partner_call_id].send_bytes(audio_chunk)
                        print(f"📤 Forwarded audio from {call_id} to {partner_call_id}")
                    except Exception as e:
                        print(f"Error forwarding audio: {e}")
                
            elif "text" in data:
                # Control message received
                message = json.loads(data["text"])
                
                if message["type"] == "start_call":
                    await handle_call_start(call_id, message)
                elif message["type"] == "end_call":
                    await handle_call_end(call_id)
                    break
                    
                elif message["type"] == "transcript":
                    # Manual transcript entry (for testing) or real transcription
                    await handle_transcript(call_id, message, websocket)
    
    except WebSocketDisconnect:
        print(f"❌ WebSocket disconnected: {call_id}")
    
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
    
    finally:
        # Cleanup
        if call_id in active_connections:
            del active_connections[call_id]
        if call_id in audio_queues:
            del audio_queues[call_id]

async def handle_call_start(call_id: str, data: dict):
    print(f"📞 Call started: {call_id}")
    # TODO: Create call record in database
    # TODO: Start transcription task
    
    # Send confirmation back to client
    if call_id in active_connections:
        await active_connections[call_id].send_json({
            "type": "call_started",
            "call_id": call_id,
            "timestamp": datetime.utcnow().isoformat()
        })

async def handle_call_end(call_id: str):
    print(f"📴 Call ended: {call_id}")
    # TODO: Update call record
    # TODO: Generate summary
    
    # Send confirmation back to client
    if call_id in active_connections:
        await active_connections[call_id].send_json({
            "type": "call_ended",
            "call_id": call_id,
            "timestamp": datetime.utcnow().isoformat()
        })

async def handle_transcript(call_id: str, message: dict, websocket: WebSocket):
    """Handle transcript segment and route to partner"""
    speaker = message.get("speaker", "customer")
    text = message.get("text", "")
    
    transcript_msg = {
        "type": "transcript",
        "speaker": speaker,
        "text": text,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Echo back to sender (for confirmation)
    await websocket.send_json(transcript_msg)
    
    # Route to partner (agent or customer)
    # Import from calls.py to check active connections
    from .calls import active_calls
    
    # Find partner's call_id
    partner_call_id = None
    for active_call_id, call_info in active_calls.items():
        if call_id == call_info.get("agent_call_id"):
            partner_call_id = call_info.get("customer_call_id")
            break
        elif call_id == call_info.get("customer_call_id"):
            partner_call_id = call_info.get("agent_call_id")
            break
    
    # Send to partner if connected
    if partner_call_id and partner_call_id in active_connections:
        try:
            await active_connections[partner_call_id].send_json(transcript_msg)
            print(f"📤 Routed message from {call_id} to {partner_call_id}")
        except Exception as e:
            print(f"Error routing message: {e}")

async def broadcast_to_call(call_id: str, message: dict):
    """Broadcast a message to a specific call's WebSocket"""
    if call_id in active_connections:
        try:
            await active_connections[call_id].send_json(message)
        except Exception as e:
            print(f"Error broadcasting to {call_id}: {e}")

