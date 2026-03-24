import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { AuthLayout } from '../components/auth/AuthLayout';
import { authAPI } from '../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('WORKER');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const roleOptions = [
        { value: 'WORKER', label: 'Worker (Find Work)' },
        { value: 'CLIENT', label: 'Client (Post Tasks)' }
    ];

    // Decode JWT to extract user data
    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to decode JWT:', error);
            return null;
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.register({
                name,
                email,
                password,
                role
            });

            const { access_token } = response.data;

            if (!access_token) {
                throw new Error('No access token received');
            }

            localStorage.setItem('token', access_token);

            // Decode JWT to get user data
            const decoded = decodeJWT(access_token);

            if (decoded) {
                localStorage.setItem('userId', decoded.sub);
                localStorage.setItem('userRole', decoded.role);
                localStorage.setItem('userName', decoded.name || decoded.email || name);
            }

            toast.success('Account created successfully! Welcome aboard.');
            window.location.href = '/dashboard';
        } catch (error: any) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create an Account"
            subtitle="Join us to start managing your tasks."
        >
            <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]" htmlFor="name">
                        Name
                    </label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]" htmlFor="email">
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]" htmlFor="role">
                        Account Type
                    </label>
                    <Dropdown
                        value={role}
                        onChange={setRole}
                        options={roleOptions}
                        placeholder="Select account type"
                        className="h-11"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pr-10 font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <Button className="w-full font-semibold text-base h-12 mt-4" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                </Button>

                <p className="text-center text-sm pt-4 text-[var(--foreground-muted)]">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold transition-colors text-[var(--accent)] hover:text-[var(--accent-bright)]">
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
