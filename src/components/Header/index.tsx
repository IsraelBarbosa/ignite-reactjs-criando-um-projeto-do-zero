import Link from 'next/link';
import Image from 'next/image';

import commonStyles from '../../styles/common.module.scss';
import headerStyles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.container} ${headerStyles.header}`}>
      <Link href="/">
        <a className={headerStyles.header}>
          <Image
            src="/images/logo.png"
            width={238.62}
            height={25.63}
            alt="logo"
          />
        </a>
      </Link>
    </header>
  );
}
