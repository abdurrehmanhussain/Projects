from typing import Dict
from .models import Account, Job

accounts: Dict[str, Account] = {}
jobs: Dict[str, Job] = {}


def seed_defaults() -> None:
    acc = Account(id="000", name="Demo Account", username="demo", monthly_allowance=500, pages_used=100)
    accounts[acc.id] = acc

    abdur = Account(id="001", name="Abdur", username="abdur", monthly_allowance=1000, pages_used=80)
    accounts[abdur.id] = abdur

    rehman = Account(id="002", name="Rehman", username="rehman", monthly_allowance=100, pages_used=50)
    accounts[rehman.id] = rehman

    james = Account(id="007", name="James Bond", username="james", monthly_allowance=1000, pages_used=400)
    accounts[james.id] = james

    john = Account(id="003", name="John Wick", username="john", monthly_allowance=800, pages_used=5)
    accounts[john.id] = john

    hjvor = Account(id="004", name="Hjvor", username="hjvor", monthly_allowance=500, pages_used=500)
    accounts[hjvor.id] = hjvor


seed_defaults()
