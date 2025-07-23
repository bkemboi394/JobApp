import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api, { setAuthToken } from '../../lib/api';
import { useRouter } from 'next/router';

//
// 1. Define & infer the Zod schema for signup data
//
const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    try {
      // 2. Create the user via /api/register/
      await api.post('register/', data);

      // 3. Immediately login via /api/token/
      const res = await api.post('token/', {
        username: data.username,
        password: data.password,
      });

      const { access } = res.data as { access: string };
      // 4. Attach token for subsequent requests
      setAuthToken(access);
      localStorage.setItem('accessToken', access);

      // 5. Redirect to dashboard
        router.push('/dashboard');
  } catch (err: any) {
    // Extract field‐level errors returned by Django
    const resp = err.response?.data || {};

    // For each field with messages, attach it to the form
    Object.entries(resp).forEach(([field, messages]) => {
      setError(
        field as keyof SignupData,
        {
          type: 'server',
          message: (messages as string[]).join(' '),
        }
      );
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

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

        {/* Email */}
        <label className="block mb-1 font-medium">Email</label>
        <input
          {...register('email')}
          placeholder="you@example.com"
          className="w-full mb-2 p-2 border rounded-lg focus:outline-none focus:ring-2"
        />
        {errors.email && (
          <p className="text-red-500 mb-2">{errors.email.message}</p>
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
          {isSubmitting ? 'Signing up…' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

