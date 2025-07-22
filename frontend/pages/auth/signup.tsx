import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../lib/api';
import { useRouter } from 'next/router';

const signupSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

type SignupData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    try {
      await api.post('users/', data);
      const res = await api.post('token/', {
        username: data.username,
        password: data.password,
      });
      const access = res.data.access as string;
      localStorage.setItem('accessToken', access);
      router.push('/dashboard');
    } catch {
      alert('Signup or login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl mb-4 font-semibold">Sign Up</h1>
        <input {...register('username')} placeholder="Username" className="w-full mb-2 p-2 border rounded" />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        <input {...register('email')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <input type="password" {...register('password')} placeholder="Password" className="w-full mb-2 p-2 border rounded" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <button type="submit" className="mt-4 w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
          Sign Up
        </button>
      </form>
    </div>
  );
}
