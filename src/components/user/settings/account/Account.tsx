import { useEffect } from "react";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { useUserStore } from "../../../../stores/UserStore";
import { fetchService } from "../../../../lib/fetchService";

export default function Account(): React.ReactElement {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    fetchService
      .get<any>("/auth/user")
      .then((res) => {
        if (res.success && res.data) {
          setUser({ ...user, ...res.data });
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCreatePassword = !user?.hasPassword;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-2">Profile</h2>

      <ProfileForm />

      <hr className="mx-2 my-4 border-gray-300 dark:border-white/50" />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-2">
        {isCreatePassword ? "Create Password" : "Change Password"}
      </h2>

      <ChangePasswordForm isCreatePassword={isCreatePassword} />
    </div>
  );
}
