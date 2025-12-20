import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Header } from "@/components/Header";

export function UpdateUserPage() {
    const { user: authUser } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            full_name: authUser?.full_name || "",
            email: authUser?.email || "",
            address: authUser?.address || "",
            dob: authUser?.dob || ""
        }
    });

    const onSubmit = async (data) => {
        try {
            await updateUserProfile(data);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            // Show server error message if available, else fallback
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Cập nhật thông tin thất bại. Vui lòng thử lại.";
            toast.error(message);
            console.error("Error updating user profile:", error);
        }
    };

    // Handle form validation errors
    const onError = (errors) => {
        // Display the first error found
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Cập nhật thông tin cá nhân</h1>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-lg mx-auto space-y-6">
                    <div>
                        <label className="block mb-2 font-medium">Họ và tên</label>
                        <input
                            type="text"
                            {...register("full_name")}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        {errors.full_name && <p className="text-red-500 mt-1">{errors.full_name.message}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Email</label>
                        <input
                            type="email"
                            {...register("email", {
                                validate: {
                                    validEmail: (value) => 
                                        !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Email không hợp lệ"
                                }
                            })}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Địa chỉ</label>
                        <input
                            type="text"
                            {...register("address")}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        {errors.address && <p className="text-red-500 mt-1">{errors.address.message}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Ngày sinh</label>
                        <input
                            type="date"
                            {...register("dob", {
                                validate: {
                                    notFuture: (value) => {
                                        if (!value) return true;
                                        const today = new Date();
                                        const selectedDate = new Date(value);
                                        return selectedDate < today || "Ngày sinh không thể là ngày trong tương lai";
                                    }
                                }
                            })}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        {errors.dob && <p className="text-red-500 mt-1">{errors.dob.message}</p>}
                    </div>
                    <div>
                        <Button
                            type="submit"
                            className="submit"
                        >
                            Cập nhật
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}