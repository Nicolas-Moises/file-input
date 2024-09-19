'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { Button } from './ui/button'
import { ControlledFileUpload } from './custom/file-upload/file-controlled'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'

export const IMAGE_TYPES = {
  'image': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
}

export const SHEETS_TYPES = {
  'text/csv': ['text/csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
}

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
export const SHEETS_MAX_SIZE = 8 * 1024 * 1024 // 8MB
export const FAVICON_MAX_SIZE = 1 * 1024 * 1024 // 1MB

export const companyStepFormSchema = z.object({
  logo: z.custom<File[]>()
})

type CompanyStepFormData = z.infer<typeof companyStepFormSchema>

export default function FormExample() {
  // const { setValue, watch } = useFormContext()

  // const initialValue = watch("company")

  const form = useForm<CompanyStepFormData>({
    resolver: zodResolver(companyStepFormSchema),
   
  });

  const onSubmit = async (data: CompanyStepFormData) => {
    // setValue("company", data)
    // await onSubmitForm()
    console.log(data)
  }
  
  return (
    <div className='py-20 bg-white'>
      <div className="self-start">
        <h2 className="font-semibold text-2xl">Para finalizarmos</h2>
        <p className="text-slate-500">Precisamos que você nos forneça mais alguns detalhes sobre sua empresa.</p>
      </div>
      <Form {...form}>
        <form className="w-full mx-auto gap-4 mt-10 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='logo'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>Logo da empresa</FormLabel>
                <FormControl>
                    <ControlledFileUpload 
                      withPreview 
                      previewMode="INSIDE" 
                      fieldName="logo" 
                      maxFiles={2} 
                      control={form.control} 
                      maxSize={IMAGE_MAX_SIZE} 
                      acceptedTypes={IMAGE_TYPES} 
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-full flex justify-end gap-4">
            <Button  type="submit" disabled={form.formState.isSubmitting}>Finalizar</Button>
          </div>
        </form>
      </Form>

    </div>
  )
}