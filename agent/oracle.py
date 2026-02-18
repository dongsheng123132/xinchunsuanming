from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
import random

class FortuneRequest(Model):
    lots: list[int]

class FortuneResponse(Model):
    interpretation: str

# You need to replace this with your own seed phrase or let it generate one
# SEED_PHRASE = "put_your_seed_phrase_here"

# Initialize the agent
# Note: In production, use a stable seed.
oracle = Agent(
    name="oracle_agent",
    port=8000,
    seed="oracle_fortune_teller_seed_123",
    endpoint=["http://127.0.0.1:8000/submit"],
)

fund_agent_if_low(oracle.wallet.address())

@oracle.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Oracle Agent Started at {oracle.address}")
    ctx.logger.info(f"Ready to interpret fortunes for 0.01 USDC (simulated)")

@oracle.on_message(model=FortuneRequest)
async def handle_fortune_request(ctx: Context, sender: str, msg: FortuneRequest):
    ctx.logger.info(f"Received fortune request from {sender} with lots: {msg.lots}")
    
    # In a real scenario, you would check for a transaction/payment here.
    # For now, we assume payment is handled or trusted.
    
    interpretations = [
        "Great fortune awaits!",
        "Caution is advised in new ventures.",
        "A surprise visitor will bring good news.",
        "Focus on your health and well-being.",
        "Financial gains are on the horizon."
    ]
    
    # Generate a deterministic but random-feeling response based on the lots
    seed_val = sum(msg.lots)
    random.seed(seed_val)
    selected_interpretation = random.choice(interpretations)
    
    detailed_response = f"Lots {msg.lots} have been cast. {selected_interpretation}"
    ctx.logger.info(f"Sending response: {detailed_response}")
    
    await ctx.send(sender, FortuneResponse(interpretation=detailed_response))

if __name__ == "__main__":
    oracle.run()
