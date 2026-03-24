from eth_utils import keccak
from eth_abi import decode
from datetime import datetime

# -------------------------------
# 1. Event signatures
# -------------------------------
EVENT_SIGS = {
    keccak(text="TaskAccepted(bytes32,address,uint256)").hex(): "TaskAccepted",
    keccak(text="TaskCreated(bytes32,address,uint256,string,uint256)").hex(): "TaskCreated",
    keccak(text="PaymentReleased(bytes32,address,uint256,string,uint256)").hex(): "PaymentReleased",
    keccak(text="AIVerified(bytes32,uint8,bool,uint256)").hex(): "AIVerified",
    keccak(text="TaskDisputed(bytes32,string,uint256)").hex(): "TaskDisputed",
    keccak(text="WorkSubmitted(bytes32,string,string,uint256)").hex(): "WorkSubmitted"
}

# -------------------------------
# 2. Helper functions
# -------------------------------
def decode_address(topic):
    return "0x" + topic[-40:]

def hex_to_int(hex_str):
    return int(hex_str, 16)

from datetime import datetime, UTC

def format_time(ts):
    return datetime.fromtimestamp(ts, UTC).strftime("%Y-%m-%d %H:%M:%S UTC")

def to_bytes(data_hex):
    return bytes.fromhex(data_hex.replace("0x", ""))


# -------------------------------
# 3. INPUT (replace with yours)
# -------------------------------
topic0 = "0x4db32d8d58d996890a29e3362634ffd96ac3d97d4915c10792e12d996f73b436"
topic1 = "0xee80ed828b50fd4db206c1ad034d16673abc5cd02de6153d6c06b3f151b7ce6c"
topic2 = "0x000000000000000000000000179be67e296c393ff15be34f77593b8934fba947"
data_hex = """
            0000000000000000000000000000000000000000000000000000000000000060
		    00000000000000000000000000000000000000000000000000000000000000c0
		    0000000000000000000000000000000000000000000000000000000069be9507
		    0000000000000000000000000000000000000000000000000000000000000040
		    6136646163646664653437383434343361303437343139656339383764376365
		    6639386630663532313462626130326664346635643563343339623561376639
		    0000000000000000000000000000000000000000000000000000000000000040
		    6264353162666532653237626464653161656637653065323430306437643535
		    3938336564646535323762353732333965653832313262316365633433323231
            """

# -------------------------------
# 4. Detect event
# -------------------------------
event_name = EVENT_SIGS.get(topic0.replace("0x", ""), "Unknown")

print("\nEvent:", event_name)


# -------------------------------
# 5. Decode logic per event
# -------------------------------
data_bytes = to_bytes(data_hex)

decoded_event = {}

# ---- TaskAccepted ----
if event_name == "TaskAccepted":
    decoded_event = {
        "taskId": topic1,
        "worker": decode_address(topic2),
        "timestamp": hex_to_int(data_hex)
    }

# ---- TaskCreated ----
elif event_name == "TaskCreated":
    amount, stripe_id, timestamp = decode(
        ['uint256', 'string', 'uint256'], data_bytes
    )
    decoded_event = {
        "taskId": topic1,
        "client": decode_address(topic2),
        "amountINR": amount,
        "stripePaymentIntentId": stripe_id,
        "timestamp": timestamp
    }

# ---- PaymentReleased ----
elif event_name == "PaymentReleased":
    amount, stripe_id, timestamp = decode(
        ['uint256', 'string', 'uint256'], data_bytes
    )
    decoded_event = {
        "taskId": topic1,
        "worker": decode_address(topic2),
        "amountINR": amount,
        "stripeTransferId": stripe_id,
        "timestamp": timestamp
    }

# ---- AIVerified ----
elif event_name == "AIVerified":
    confidence, approved, timestamp = decode(
        ['uint8', 'bool', 'uint256'], data_bytes
    )
    decoded_event = {
        "taskId": topic1,
        "confidence": confidence,
        "approved": approved,
        "timestamp": timestamp
    }

# ---- TaskDisputed ----
elif event_name == "TaskDisputed":
    reason, timestamp = decode(
        ['string', 'uint256'], data_bytes
    )
    decoded_event = {
        "taskId": topic1,
        "reason": reason,
        "timestamp": timestamp
    }

# ---- WorkSubmitted ----
elif event_name == "WorkSubmitted":
    before, after, timestamp = decode(
        ['string', 'string', 'uint256'], data_bytes
    )
    decoded_event = {
        "taskId": topic1,
        "beforeImageHash": before,
        "afterImageHash": after,
        "timestamp": timestamp
    }

else:
    print("⚠️ Unknown event signature")


# -------------------------------
# 6. Add readable time if exists
# -------------------------------
if "timestamp" in decoded_event:
    decoded_event["readableTime"] = format_time(decoded_event["timestamp"])


# -------------------------------
# 7. Output
# -------------------------------
print("\nDecoded Event:")
print(decoded_event)