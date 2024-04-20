import { GetStaticProps } from 'next';

import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: {
        results: postsResponse.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        }),
        next_page: postsResponse.next_page,
      },
    },
  };
};

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPageLink, setNextPageLink] = useState<string>(next_page);

  const loadMorePosts = async (): Promise<void> => {
    if (!nextPageLink) return;

    const nextPageResponse = await fetch(nextPageLink);
    const nextPage: PostPagination = await nextPageResponse.json();

    setPosts([...posts, ...nextPage.results]);
    setNextPageLink(nextPage.next_page);
  };

  return (
    <>
      <Header />

      <main className={`${commonStyles.container} ${styles.main}`}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <article key={post.uid} className={styles.post}>
                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
                <div className={styles.info}>
                  <time>
                    <FiCalendar />{' '}
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <span>
                    <FiUser /> {post.data.author}
                  </span>
                </div>
              </article>
            </a>
          </Link>
        ))}

        {nextPageLink && (
          <button type="button" onClick={loadMorePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}
