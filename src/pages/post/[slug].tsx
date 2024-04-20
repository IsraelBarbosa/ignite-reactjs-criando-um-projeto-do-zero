import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';

import Image from 'next/image';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as prismicDOM from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const calculateWordsLength = (text: string): number => {
  return text.split(/\s+/).length;
};

const calculateReadingTime = ({
  heading,
  body,
}: {
  heading: string;
  body: {
    text: string;
  };
}): number => {
  const wordsPerMinute = 200;
  const lengthWordsHeading = calculateWordsLength(heading);
  const lengthWordsBody = calculateWordsLength(body.text);
  const totalLengthWords = lengthWordsHeading + lengthWordsBody;
  const readingTime = Math.ceil(totalLengthWords / wordsPerMinute);

  return readingTime;
};

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const readingTime = post.data.content.reduce((aC, content) => {
    return (
      aC +
      calculateReadingTime({
        heading: content.heading,
        body: { text: prismicDOM.RichText.asText(content.body) },
      })
    );
  }, 0);

  return (
    <>
      <Header />

      <main className={`${styles.main}`}>
        <div className={`${styles.post}`}>
          <Image
            src={post.data.banner.url.toString()}
            width={720}
            height={400}
            alt={post.data.title}
          />

          <div className={`${commonStyles.container}`}>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <time>
                <FiCalendar />{' '}
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <span>
                <FiUser /> {post.data.author}
              </span>
              <span>
                <FiClock /> {readingTime} min
              </span>
            </div>

            {post.data.content.map(content => (
              <div key={content.heading} className={styles.content}>
                <h2>{content.heading}</h2>
                {content.body.map(text => (
                  <p key={text.text}>{text.text}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
}: GetStaticPropsContext) => {
  const prismic = getPrismicClient({});
  const postResponse = await prismic.getByUID('post', `${params?.slug}`);

  return {
    props: { post: postResponse },
  };
};
