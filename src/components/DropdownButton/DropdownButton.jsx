import { useState, useEffect, useRef } from "react";
import Button from "../Button";
import "./DropdownButton.scss";

export const DropdownButton = ({ title, onClick, dropdownItems }) => {
  const [dropdownOpen, toggleDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      toggleDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  if (dropdownItems?.length === 0) {
    return;
  }

  return (
    <div className="dropdown" ref={dropdownRef}>
      <Button
        title={title}
        onClick={() => onClick(() => toggleDropdown(!dropdownOpen))}
        className="dropdown-button"
      />
      {dropdownOpen && (
        <div className="dropdown-items">
          {dropdownItems.map(({ title, onClick }, index) => (
            <Button
              className="dropdown-item-button"
              key={index}
              title={title}
              onClick={() => {
                onClick();
                toggleDropdown(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
