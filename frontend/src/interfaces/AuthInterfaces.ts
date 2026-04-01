export interface AuthUser {
  id: string,
  username: string,
  firstname: string,
  lastname: string,
  email: string,
  profile_pic: string
  role: string
}



export interface SignupFormData {
  firstname: string;
  lastname: string;
  username: string;
  email: string,
  agreeToTerms?:boolean;
  password: string;
  confirmPassword: string;
}


export interface SignupErrors {
  firstname?: string;
  lastname?: string;
  username?: string;
  password?: string;
  email?: string;
  confirmPassword?: string;
  agreeToTerms?: string; 
  general?: string;
}