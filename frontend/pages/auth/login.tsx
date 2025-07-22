import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api, { setAuthToken } from '../../lib/api';
import { useRouter } from 'next/router';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const res = await api.post('token/', data);
      const access = res.data.access as string;
      setAuthToken(access);
      localStorage.setItem('accessToken', access);
      router.push('/dashboard');
    } catch {
      alert('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl mb-4 font-semibold">Log In</h1>
        <input
          {...register('username')}
          placeholder="Username"
          className="w-full mb-2 p-2 border rounded"
        />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        <input
          type="password"
          {...register('password')}
          placeholder="Password"
          className="w-full mb-2 p-2 border rounded"
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <button type="submit" className="mt-4 w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
          Log In
        </button>
      </form>
    </div>
  );
}
