import { Input } from '@/components/ui/input'
import { UseFormRegisterReturn } from 'react-hook-form'

interface FormInputProps extends React.ComponentProps<typeof Input> {
  registration?: UseFormRegisterReturn
}

export function FormInput({ registration, ...props }: FormInputProps) {
  return <Input {...registration} {...props} />
}
