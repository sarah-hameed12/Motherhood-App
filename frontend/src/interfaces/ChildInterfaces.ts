export interface ChildFull {
  id: string;
  firstname: string;
  lastname: string;
  profile_pic?: string;
  gender: string;
  date_of_birth: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  head_circumference?: number;
}


export interface ChildPersonal {
  id: string;
  firstname: string;
  lastname: string;
  profile_pic?: string;
  gender: string;
  date_of_birth: string;
}


export interface UpdateChildPersonalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    firstname: string;
    lastname: string;
    profile_pic?: string;
    gender: string;
    date_of_birth: string;
  }) => void;
  child: ChildPersonal;
  saving?: boolean;
}




export interface ChildPhysical {
  id: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  head_circumference?: number;
}

export interface UpdateChildPhysicalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    blood_type?: string;
    height?: number;
    weight?: number;
    head_circumference?: number;
  }) => void;
  child: ChildPhysical;
  saving?: boolean;
}