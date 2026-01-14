from Services.orchestrator import run_orchestration

class Asset:
    def __init__(self, asset_id, required_certifications=None, health_score=10, risk_level=5):
        self.asset_id = asset_id
        self.required_certifications = required_certifications
        self.health_score = health_score
        self.risk_level = risk_level

class Order:
    def __init__(self, order_id, asset_id, task_type='Repair'):
        self.order_id = order_id
        self.asset_id = asset_id
        self.task_type = task_type

class Eng:
    def __init__(self, engineer_id, name, certifications=None, fatigue=0.0):
        self.engineer_id = engineer_id
        self.name = name
        self.certifications = certifications
        self.fatigue = fatigue

assets = [Asset('A1', required_certifications=['ELECT'], health_score=20, risk_level=5)]
orders = [Order('O1', 'A1', task_type='Emergency Repair')]
# Engineer without certification
engs = [Eng('E1','Bob', certifications=[], fatigue=0.0), Eng('E2','Alice', certifications=['ELECT'], fatigue=0.2)]

alloc = run_orchestration(assets, orders, engs)
print('ALLOC:', alloc)
