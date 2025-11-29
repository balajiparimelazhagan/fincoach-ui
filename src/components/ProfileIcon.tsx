interface IProfileIconProps {
  onClick?: () => void;
}

const ProfileIcon: React.FC<IProfileIconProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-12 h-12 rounded-full overflow-hidden border cursor-pointer"
    >
      <img
        src="/default-profile-pic.png"
        alt="Profile"
        className="w-full h-full object-cover mx-auto my-auto"
      />
    </div>
  );
};

export default ProfileIcon;
