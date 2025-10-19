"""Mortgage calculation logic with variable interest rates."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any


@dataclass
class MortgageParams:
    """Parameters for mortgage calculation."""

    mortgage_debt: float
    mortgage_term: int
    interest_rate: float
    mortgage_type: str = "repayment"
    monthly_payment: Optional[float] = None
    one_off_overpayment: float = 0.0
    recurring_overpayment: float = 0.0
    recurring_frequency: str = "monthly"
    interest_rate_changes: Dict[int, float] = None

    def __post_init__(self) -> None:
        """Initialize default values."""
        if self.interest_rate_changes is None:
            self.interest_rate_changes = {}


def calculate_monthly_payment(
    principal: float, annual_rate: float, months: int
) -> float:
    """
    Calculate monthly payment for a mortgage.

    Args:
        principal: Loan amount
        annual_rate: Annual interest rate as percentage
        months: Number of months

    Returns:
        Monthly payment amount
    """
    if annual_rate == 0:
        return principal / months

    monthly_rate = annual_rate / 100 / 12
    payment = (
        principal
        * (monthly_rate * (1 + monthly_rate) ** months)
        / ((1 + monthly_rate) ** months - 1)
    )
    return payment


def calculate_baseline_schedule(
    initial_balance: float,
    base_payment: float,
    total_months: int,
    initial_rate: float,
    rate_changes: Dict[int, float]
) -> List[Dict[str, Any]]:
    """
    Calculate baseline mortgage schedule without overpayments.

    Args:
        initial_balance: Starting mortgage balance
        base_payment: Monthly payment amount
        total_months: Total mortgage term in months
        initial_rate: Initial interest rate
        rate_changes: Dictionary of rate changes by year

    Returns:
        List of monthly balance snapshots
    """
    balance = initial_balance
    baseline_schedule = []
    current_rate = initial_rate
    current_year = 0

    for month in range(total_months):
        if balance <= 0.01:
            baseline_schedule.append({
                "month": month,
                "year": month // 12,
                "balance": 0.0
            })
            continue

        year = month // 12
        if year != current_year:
            current_year = year
            if year in rate_changes:
                current_rate = rate_changes[year]

        monthly_rate = current_rate / 100 / 12
        interest_payment = balance * monthly_rate
        principal_payment = min(base_payment - interest_payment, balance)
        balance -= principal_payment

        baseline_schedule.append({
            "month": month,
            "year": year,
            "balance": max(0.0, balance)
        })

    return baseline_schedule


def calculate_mortgage(params: MortgageParams) -> Dict[str, Any]:
    """
    Calculate mortgage with overpayments and variable rates.

    Args:
        params: Mortgage calculation parameters

    Returns:
        Dictionary with calculation results
    """
    balance = params.mortgage_debt
    total_months = params.mortgage_term * 12
    current_rate = params.interest_rate

    if params.monthly_payment:
        base_payment = params.monthly_payment
    else:
        base_payment = calculate_monthly_payment(
            balance, current_rate, total_months
        )

    # Calculate baseline schedule without overpayments
    baseline_schedule = calculate_baseline_schedule(
        params.mortgage_debt,
        base_payment,
        total_months,
        params.interest_rate,
        params.interest_rate_changes
    )

    schedule: List[Dict[str, Any]] = []
    total_interest_paid = 0.0
    total_principal_paid = 0.0
    month = 0
    current_year = 0

    one_off_applied = False

    while balance > 0.01 and month < total_months:
        year = month // 12

        if year != current_year:
            current_year = year
            if year in params.interest_rate_changes:
                current_rate = params.interest_rate_changes[year]

        monthly_rate = current_rate / 100 / 12
        interest_payment = balance * monthly_rate

        if params.mortgage_type == "interest_only":
            principal_payment = 0.0
        else:
            principal_payment = min(base_payment - interest_payment, balance)

        overpayment = 0.0

        if not one_off_applied and params.one_off_overpayment > 0:
            overpayment += params.one_off_overpayment
            one_off_applied = True

        if params.recurring_overpayment > 0:
            if params.recurring_frequency == "monthly":
                overpayment += params.recurring_overpayment
            elif params.recurring_frequency == "yearly" and month % 12 == 0:
                overpayment += params.recurring_overpayment

        total_principal = min(principal_payment + overpayment, balance)
        balance -= total_principal

        total_interest_paid += interest_payment
        total_principal_paid += total_principal

        schedule.append({
            "month": month,
            "year": year,
            "balance": max(0, balance),
            "interest": interest_payment,
            "principal": total_principal,
            "overpayment": overpayment,
            "rate": current_rate
        })

        month += 1

    months_saved = total_months - month
    years_saved = months_saved // 12
    months_remainder = months_saved % 12

    base_total_interest = (
        base_payment * total_months - params.mortgage_debt
    )
    interest_saved = base_total_interest - total_interest_paid

    return {
        "monthly_payment": base_payment,
        "total_repayment": total_principal_paid + total_interest_paid,
        "total_interest": total_interest_paid,
        "interest_saved": max(0, interest_saved),
        "months_cleared": month,
        "years_saved": years_saved,
        "months_saved_remainder": months_remainder,
        "final_balance": balance,
        "schedule": schedule,
        "baseline_schedule": baseline_schedule,
        "overpayment_summary": {
            "one_off": params.one_off_overpayment if one_off_applied else 0,
            "recurring_total": (
                params.recurring_overpayment
                * (month if params.recurring_frequency == "monthly" else month // 12)
            )
        }
    }
