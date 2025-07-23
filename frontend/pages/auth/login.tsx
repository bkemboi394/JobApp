import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api, { setAuthToken } from '../../lib/api';
import { useRouter } from 'next/router';

// 1) Zod schema for client-side validation
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    // 2) Clean up whitespace and prepare payload
    const payload = {
      username: data.username.trim(),
      password: data.password.trim(),
    };

    // 3) Log for debugging
    console.log('🔑 Login payload:', payload);
    console.log('🌐 Axios baseURL:', api.defaults.baseURL);

    try {
      // 4) Call your custom JWT endpoint
      const res = await api.post('token/', payload);
      const { access } = res.data as { access: string };

      // 5) Store & attach the access token
      setAuthToken(access);
      localStorage.setItem('accessToken', access);

      // 6) Redirect on success
      router.push('/dashboard');
    } catch (err: any) {
      // 7) Grab the 'detail' error
      const detail: string =
        err.response?.data?.detail || 'Login failed. Please try again.';

      // 8) Show it under both username & password fields
      ['username', 'password'].forEach((field) => {
        setError(field as keyof LoginData, {
          type: 'server',
          message: detail,
        });
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Log In</h1>

        {/* Username */}
        <label className="block mb-1 font-medium">Username</label>
        <input
          {...register('username')}
          placeholder="Your username"
          className="w-full mb-2 p-2 border rounded-lg focus:outline-none focus:ring-2"
        />
        {errors.username && (
          <p className="text-red-500 mb-2">{errors.username.message}</p>
        )}

        {/* Password */}
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          {...register('password')}
          placeholder="••••••••"
          className="w-full mb-2 p-2 border rounded-lg focus:outline-none focus:ring-2"
        />
        {errors.password && (
          <p className="text-red-500 mb-2">{errors.password.message}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
