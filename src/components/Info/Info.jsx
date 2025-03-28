import "./Info.scss";
import DropdownButton from "../DropdownButton";

export const Info = () => {
  const address = "9850 64th St W, University Place, WA 98467, United States";
  const encodedAddress = encodeURIComponent(address);
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

  const isMobile =
    /Android|webOS|BlackBerry|IEMobile|Opera Mini/.test(userAgent) || isIOS;

  const openGoogleMaps = () => {
    window.location.href = `comgooglemaps://?q=${encodedAddress}`;
  };

  const openAppleMaps = () => {
    window.location.href = `maps://?q=${encodedAddress}`;
  };

  const handleDropdownClick = (toggleDropdown) => {
    if (!isIOS) {
      openGoogleMaps();
    } else {
      toggleDropdown();
    }
  };

  const dropdownItems = [
    { title: "maps", onClick: openAppleMaps },
    { title: "Google maps", onClick: openGoogleMaps },
  ];

  return (
    <>
      <section>
        <h2>Date</h2>
        <p className="date align-center">2025 May 11th Sunday 2pm</p>
      </section>
      <section>
        <h2>Location</h2>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25108.479142288885!2d-122.55607080962534!3d47.205423208777496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5491aa0e630edddb%3A0xd09815d6eb312126!2sEnvironmental%20Services%20Building!5e0!3m2!1sen!2sca!4v1742681607959!5m2!1sen!2sca"
          className="map"
          allowFullScreen="yes"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        {isMobile && (
          <DropdownButton
            title="Open in App"
            onClick={handleDropdownClick}
            dropdownItems={dropdownItems}
          />
        )}
        <p>9850 64th St W, University Place, WA 98467, United States</p>
      </section>
    </>
  );
};
