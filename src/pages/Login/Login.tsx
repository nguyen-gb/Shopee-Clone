import { useForm } from 'react-hook-form'
import { Schema, schema } from 'src/utils/rules'
import { Link, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import authApi from 'src/apis/auth.api'
import { useMutation } from '@tanstack/react-query'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponse } from 'src/types/utils.type'
import Input from 'src/components/Input'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import Button from 'src/components/Button'
import { Helmet } from 'react-helmet-async'

type FormData = Pick<Schema, 'email' | 'password'>
const schemaLogin = schema.pick(['email', 'password'])

export default function Login() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schemaLogin)
  })

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => authApi.login(body)
  })
  const onSubmit = handleSubmit((body) => {
    loginMutation.mutate(body, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        navigate('/')
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })

  return (
    <div className='bg-orange'>
      <Helmet>
        <title>Đăng nhập | Shopee Clone</title>
        <meta name='description' content='Đăng nhập vào dự án Shopee Clone' />
      </Helmet>
      <div className='mx-auto max-w-7xl px-4'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl'>Đăng nhập</div>
              <Input
                className='mt-8'
                type='email'
                placeholder='Email'
                name='email'
                register={register}
                errorMessage={errors.email?.message}
              />
              <Input
                className='mt-2'
                type='password'
                placeholder='Password'
                name='password'
                register={register}
                errorMessage={errors.password?.message}
                autoComplete='on'
                classNameEye='absolute right-[5px] top-[12px] h-5 w-5 cursor-pointer'
              />
              <div className='mt-2'>
                <Button
                  isLoading={loginMutation.isLoading}
                  disabled={loginMutation.isLoading}
                  type='submit'
                  className='flex w-full items-center justify-center bg-orange bg-opacity-70 px-2 py-4 text-center text-sm uppercase text-white hover:cursor-pointer hover:bg-orange'
                >
                  Đăng nhập
                </Button>
              </div>
              <div className='mt-8 flex items-center justify-center'>
                <span className=' text-gray-400'>Bạn chưa có tài khoản? </span>
                <Link to='/register' className='ml-1 text-red-500'>
                  Đăng ký
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
