import {
  ClockIcon,
  DocumentAddIcon,
  LightningBoltIcon,
  StarIcon,
} from "@heroicons/react/outline";
import { PlusIcon } from "@heroicons/react/solid";
import { ObjectId } from "mongodb";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import type { Course, Program, Review } from "src/@types";
import { Review as ReviewComponent } from "src/components/review";
import { connectToDatabase } from "src/lib/mongodb";
import { formatList, formatNumber } from "src/util/format";

interface ReviewsPathParams {
  slug: Course["slug"];
  [key: string]: string | string[];
}

type CourseWithReviews = Course & {
  programs: Array<Pick<Program, "acronym">>;
  reviews: Array<Review>;
};

interface ReviewsPageProps {
  course: CourseWithReviews & {
    rating: number;
    difficulty: number;
    workload: number;
  };
}

function average(
  reviews: Pick<Review, "rating" | "difficulty" | "workload">[],
  key: keyof Pick<Review, "rating" | "difficulty" | "workload">,
): number {
  let sum = 0;
  let count = 0;

  reviews.forEach((review) => {
    const value = review[key];
    if (value) {
      count += 1;
      sum += value;
    }
  });

  return sum / count;
}

export const getStaticPaths: GetStaticPaths<ReviewsPathParams> = async () => {
  const { db } = await connectToDatabase();

  const slugs = await db.collection("courses").distinct("slug");

  const paths = slugs.map((slug) => {
    return { params: { slug: slug } };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  ReviewsPageProps,
  ReviewsPathParams
> = async ({ params: { slug } = {} }) => {
  if (!slug) {
    throw new Error("No slug passed to `getStaticProps`");
  }

  const { db } = await connectToDatabase();

  let course = await JSON.parse(
    JSON.stringify(
      await db.collection("courses").findOne({
        slug: slug,
      }),
    ),
  );

  if (!course) {
    throw new Error("Course not found");
  }

  const reviews = await JSON.parse(
    JSON.stringify(
      await db
        .collection("reviews")
        .find({ courseId: new ObjectId(course._id as string) })
        .toArray(),
    ),
  );

  course = { ...course, reviews };

  const rating = average(reviews, "rating");
  const difficulty = average(reviews, "difficulty");
  const workload = average(reviews, "workload");

  return { props: { course: { ...course, rating, difficulty, workload } } };
};

export default function Reviews({
  course: {
    slug,
    creditHours,
    description,
    name,
    syllabusUrl,
    reviews,
    rating,
    difficulty,
    workload,
  },
}: ReviewsPageProps): JSX.Element {
  const programAcronyms: string[] = [];

  return (
    <>
      <Head>
        <title>{`${name} | OMSCentral`}</title>
      </Head>
      <main className="m-auto max-w-6xl px-5 py-10">
        <h3 className="mb-2 text-center text-3xl font-medium text-gray-900 lg:text-left">
          {name}
        </h3>
        {reviews.length > 0 && (
          <div className="flex justify-center gap-2 lg:justify-start lg:gap-7">
            <span className="flex items-center gap-0 lg:gap-1">
              <StarIcon className="h-5 w-5 stroke-indigo-600" />
              {formatNumber(rating)} / 5 rating
            </span>
            <span className="flex items-center gap-0 lg:gap-1">
              <LightningBoltIcon className="h-5 w-5 stroke-indigo-600" />
              {formatNumber(difficulty)} / 5 difficulty
            </span>
            <span className="flex items-center gap-0 lg:gap-1">
              <ClockIcon className="h-5 w-5 stroke-indigo-600" />
              {formatNumber(workload)} hrs / week
            </span>
          </div>
        )}
        <div className="mt-10 flex flex-col items-center gap-4 lg:flex-row lg:items-start">
          <div className="mx-auto max-w-xl grow bg-white shadow sm:rounded-lg lg:sticky lg:top-4 lg:max-h-screen lg:overflow-y-auto">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Quick Facts and Resources
              </h3>
              <p className="mt-1 max-w-2xl text-xs text-gray-500">
                Something missing or incorrect?{" "}
                <a
                  href={`https://github.com/oms-tech/reviews/issues/new?template=course-edit-request.md&title=[EDIT] ${name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Tell us more.
                </a>
              </p>
            </div>
            <div className="border-t border-gray-200 p-0 px-4 py-5">
              <dl className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 gap-4 px-6 py-5">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="col-span-2 mt-0 text-sm text-gray-900">
                    {name}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-5">
                  <dt className="text-sm font-medium text-gray-500">
                    Credit Hours
                  </dt>
                  <dd className="col-span-2 mt-0 text-sm text-gray-900">
                    {creditHours}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-5">
                  <dt className="text-sm font-medium text-gray-500">
                    Available to
                  </dt>
                  <dd className="col-span-2 mt-0 text-sm text-gray-900">
                    {formatList(programAcronyms)} students
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-5">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="col-span-3 mt-0 text-sm text-gray-900 sm:col-span-2 lg:col-span-3">
                    {description ?? "Course description not found."}{" "}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-5">
                  <dt className="text-sm font-medium text-gray-500">
                    Syllabus
                  </dt>
                  <dd className="col-span-2 mt-0 text-sm text-gray-900">
                    {syllabusUrl ? (
                      <a
                        href={syllabusUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Syllabus
                      </a>
                    ) : (
                      "Syllabus not found."
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          {reviews.length > 0 ? (
            <ul className="space-y-4 divide-gray-200">
              {reviews.map((review) => (
                <li key={review._id}>
                  <ReviewComponent review={review} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="w-full max-w-xl grow bg-white px-4 py-2 shadow sm:rounded-lg lg:max-w-full">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <DocumentAddIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No reviews
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by writing a review.
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/reviews/new?course=${slug}`}
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white no-underline shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <PlusIcon
                        className="-ml-1 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      New Review
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
