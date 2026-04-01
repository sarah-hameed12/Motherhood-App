from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vaccination import VaccinationReminder, VaccinationOption
from app.models.child import Child
from app.schemas.vaccination_schemas import VaccinationReminderCreate


class VaccinationReminderController:

    @staticmethod
    async def create_reminder(data: VaccinationReminderCreate, user_id: str, db: AsyncSession):
        """
        Create a new vaccination reminder for a child
        Only if the child belongs to the authenticated user
        """
        # Verify the child belongs to the user
        stmt_child = select(Child).where(
            (Child.id == data.child_id) & (Child.mother_id == user_id)
        )
        result_child = await db.execute(stmt_child)
        child = result_child.scalar_one_or_none()

        if not child:
            raise HTTPException(status_code=403, detail="You do not own this child.")

        # Verify the vaccine exists
        stmt_vaccine = select(VaccinationOption).where(VaccinationOption.id == data.vaccine_id)
        result_vaccine = await db.execute(stmt_vaccine)
        vaccine = result_vaccine.scalar_one_or_none()

        if not vaccine:
            raise HTTPException(status_code=404, detail="Vaccine not found.")

        # Check if reminder already exists for this child and vaccine
        stmt_existing = select(VaccinationReminder).where(
            (VaccinationReminder.child_id == data.child_id) &
            (VaccinationReminder.vaccine_id == data.vaccine_id)
        )
        result_existing = await db.execute(stmt_existing)
        existing_reminder = result_existing.scalar_one_or_none()

        if existing_reminder:
            raise HTTPException(status_code=400, detail="Reminder already exists for this child and vaccine.")

        # Create new reminder
        new_reminder = VaccinationReminder(
            child_id=data.child_id,
            vaccine_id=data.vaccine_id,
            reminder=data.reminder
        )

        db.add(new_reminder)
        await db.commit()
        await db.refresh(new_reminder)

        return new_reminder

    @staticmethod
    async def getList(user_id: str, db: AsyncSession):
        """
        Return all vaccination reminders for all children owned by this authenticated user.
        """
        stmt_children = select(Child.id).where(Child.mother_id == user_id)
        result_children = await db.execute(stmt_children)
        child_ids = [row[0] for row in result_children.fetchall()]

        if not child_ids:
            return [] 
        
        stmt = (
            select(
                VaccinationReminder.id,
                VaccinationReminder.child_id,
                VaccinationReminder.vaccine_id,
                VaccinationReminder.reminder,
                VaccinationOption.vaccine_name
            )
            .join(VaccinationOption, VaccinationOption.id == VaccinationReminder.vaccine_id)
            .where(VaccinationReminder.child_id.in_(child_ids))
        )

        result = await db.execute(stmt)
        reminders = result.fetchall()

        return [
            {
                "id": r.id,
                "child_id": r.child_id,
                "vaccine_id": r.vaccine_id,
                "vaccine_name": r.vaccine_name,
                "reminder": r.reminder,
            }
            for r in reminders
        ]

    @staticmethod
    async def getDetail(user_id: str, reminder_id: str, child_id: str, db: AsyncSession):
        """
        Return detail of one vaccination reminder ONLY if:
        - child belongs to authenticated user
        - reminder matches reminder_id AND child_id
        """
        stmt_child = select(Child).where(
            (Child.id == child_id) & (Child.mother_id == user_id)
        )
        result_child = await db.execute(stmt_child)
        child = result_child.scalar_one_or_none()

        if not child:
            raise HTTPException(status_code=403, detail="You do not own this child.")

        stmt = (
            select(
                VaccinationReminder.id,
                VaccinationReminder.child_id,
                VaccinationReminder.vaccine_id,
                VaccinationReminder.reminder,
                VaccinationOption.vaccine_name,
                VaccinationOption.description,
                VaccinationOption.protect_against,
                VaccinationOption.doses_needed,
                VaccinationOption.is_mandatory,
            )
            .join(VaccinationOption, VaccinationOption.id == VaccinationReminder.vaccine_id)
            .where(
                (VaccinationReminder.id == reminder_id)
                & (VaccinationReminder.child_id == child_id)
            )
        )

        result = await db.execute(stmt)
        reminder = result.first()

        if not reminder:
            raise HTTPException(status_code=404, detail="Vaccination reminder not found.")

        return {
            "id": reminder.id,
            "child_id": reminder.child_id,
            "vaccine_id": reminder.vaccine_id,
            "vaccine_name": reminder.vaccine_name,
            "reminder": reminder.reminder,
            "vaccine_description": reminder.description,
            "protect_against": reminder.protect_against,
            "doses_needed": reminder.doses_needed,
            "is_mandatory": reminder.is_mandatory,
        }