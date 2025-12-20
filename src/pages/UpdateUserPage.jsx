import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, changeUserPassword } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Header } from "@/components/Header";

export function UpdateUserPage({ onlyProfileTab = false, onlyPasswordTab = false }) {
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState(onlyPasswordTab ? "password" : "profile");

    // Form for profile update
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: errorsProfile }
    } = useForm({
        defaultValues: {
            full_name: authUser?.full_name || "",
            email: authUser?.email || "",
            address: authUser?.address || "",
            dob: authUser?.dob || ""
        }
    });

    // Form for password change
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: errorsPassword },
        reset: resetPassword
    } = useForm({
        defaultValues: {
            old_password: "",
            new_password: "",
            confirm_password: ""
        }
    });

    const onSubmitProfile = async (data) => {
        try {
            await updateUserProfile(data);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Cập nhật thông tin thất bại. Vui lòng thử lại.";
            toast.error(message);
            console.error("Error updating user profile:", error);
        }
    };

    const onSubmitPassword = async (data) => {
        try {
            await changeUserPassword({
                oldPassword: data.old_password,
                newPassword: data.new_password
            });
            toast.success("Đổi mật khẩu thành công!");
            resetPassword();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Đổi mật khẩu thất bại. Vui lòng thử lại.";
            toast.error(message);
            console.error("Error changing password:", error);
        }
    };

    // Handle form validation errors
    const onError = (errors) => {
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    return (
        <div className={onlyProfileTab || onlyPasswordTab ? "" : "min-h-screen bg-background"}>
            {/* Header chỉ hiển thị khi không nhúng */}
            {!onlyProfileTab && !onlyPasswordTab && <Header />}
            <div className={onlyProfileTab || onlyPasswordTab ? "" : "container mx-auto px-4 py-8"}>
                {!onlyProfileTab && !onlyPasswordTab && (
                    <h1 className="text-2xl font-bold mb-6">Quản lý tài khoản</h1>
                )}

                {/* Tabs */}
                {!onlyProfileTab && !onlyPasswordTab && (
                    <div className="flex border-b mb-6">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`px-6 py-3 font-medium transition-colors ${
                                activeTab === "profile"
                                    ? "border-b-2 border-black text-black"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Thông tin cá nhân
                        </button>
                        <button
                            onClick={() => setActiveTab("password")}
                            className={`px-6 py-3 font-medium transition-colors ${
                                activeTab === "password"
                                    ? "border-b-2 border-black text-black"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Đổi mật khẩu
                        </button>
                    </div>
                )}

                {/* Profile Update Tab */}
                {(activeTab === "profile" || onlyProfileTab) && !onlyPasswordTab && (
                    <form
                        onSubmit={handleSubmitProfile(onSubmitProfile, onError)}
                        className="max-w-lg mx-auto space-y-6"
                    >
                        <div>
                            <label className="block mb-2 font-medium">Họ và tên</label>
                            <input
                                type="text"
                                {...registerProfile("full_name")}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            {errorsProfile.full_name && (
                                <p className="text-red-500 mt-1">{errorsProfile.full_name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Email</label>
                            <input
                                type="email"
                                {...registerProfile("email", {
                                    validate: {
                                        validEmail: (value) =>
                                            !value ||
                                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                                            "Email không hợp lệ"
                                    }
                                })}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            {errorsProfile.email && (
                                <p className="text-red-500 mt-1">{errorsProfile.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Địa chỉ</label>
                            <input
                                type="text"
                                {...registerProfile("address")}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            {errorsProfile.address && (
                                <p className="text-red-500 mt-1">{errorsProfile.address.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Ngày sinh</label>
                            <input
                                type="date"
                                {...registerProfile("dob", {
                                    validate: {
                                        notFuture: (value) => {
                                            if (!value) return true;
                                            const today = new Date();
                                            const selectedDate = new Date(value);
                                            return (
                                                selectedDate < today ||
                                                "Ngày sinh không thể là ngày trong tương lai"
                                            );
                                        }
                                    }
                                })}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            {errorsProfile.dob && (
                                <p className="text-red-500 mt-1">{errorsProfile.dob.message}</p>
                            )}
                        </div>
                        <div>
                            <Button type="submit" className="submit">
                                Cập nhật
                            </Button>
                        </div>
                    </form>
                )}

                {/* Password Change Tab */}
                {(activeTab === "password" || onlyPasswordTab) && !onlyProfileTab && (
                    <form
                        onSubmit={handleSubmitPassword(onSubmitPassword, onError)}
                        className="max-w-lg mx-auto space-y-6"
                    >
                        <div>
                            <label className="block mb-2 font-medium">Mật khẩu cũ</label>
                            <input
                                type="password"
                                {...registerPassword("old_password", {
                                    required: "Vui lòng nhập mật khẩu cũ"
                                })}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            {errorsPassword.old_password && (
                                <p className="text-red-500 mt-1">{errorsPassword.old_password.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Mật khẩu mới</label>
                            <input
                                type="password"
                                {...registerPassword("new_password", {
                                    required: "Vui lòng nhập mật khẩu mới",
                                    minLength: {
                                        value: 6,
                                        message: "Mật khẩu phải có ít nhất 6 ký tự"
                                    }
                                })}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            {errorsPassword.new_password && (
                                <p className="text-red-500 mt-1">{errorsPassword.new_password.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                {...registerPassword("confirm_password", {
                                    required: "Vui lòng xác nhận mật khẩu mới",
                                    validate: (value, formValues) =>
                                        value === formValues.new_password ||
                                        "Mật khẩu xác nhận không khớp"
                                })}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            {errorsPassword.confirm_password && (
                                <p className="text-red-500 mt-1">
                                    {errorsPassword.confirm_password.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Button type="submit" className="submit">
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}