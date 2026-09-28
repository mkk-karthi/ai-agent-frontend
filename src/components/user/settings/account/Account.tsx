import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

export default function Account({ onClose }: { onClose?: () => void }): React.ReactElement {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-2">Profile</h2>

      <ProfileForm />

      <hr className="mx-2 my-4 border-gray-300 dark:border-white/50" />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-2">Change Password</h2>

      <ChangePasswordForm />
    </div>
  );
}
