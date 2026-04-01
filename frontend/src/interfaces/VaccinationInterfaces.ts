interface VaccineScheduleMini {
    dose_num: number
    min_age_days: number
    max_age_days: number
}

export interface VaccineUserView {
    vaccine_option_id: string
    vaccine_name: string
    vaccine_description: string
    doses_needed: number
    is_mandatory: boolean

    schedules: VaccineScheduleMini[]
}


export interface RequiredVaccination {
    vaccine_id: string
    vaccine_name: string
    description: string
    protect_against: string
    is_mandatory: boolean
    schedule_id: string
    dose_num: number
    min_days_age: number
    max_days_age: number
}