export interface MenuListType {
  icon: React.ReactNode;
  link: string;
  name: string;
}

export interface FormProps<T> {
  defaultValues?: T;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
}

export interface apiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: { [index: string]: string };
}
