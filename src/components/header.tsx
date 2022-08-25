import { Fragment, useState, useEffect, forwardRef } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import classNames from "classnames";

import { Disclosure, Menu, Transition } from "@headlessui/react";

import {
  MenuIcon,
  XIcon,
  ChevronDownIcon,
  ClockIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  ChipIcon,
} from "@heroicons/react/outline";

import { PlusSmIcon } from "@heroicons/react/solid";

import logo from "public/logo.svg";

const reviewsMenuItems = [
  {
    title: "Most Recent",
    subtitle: "The 100 most recently submitted reviews",
    href: "/reviews/recent",
    icon: ClockIcon,
  },
  {
    title: "CS-6250",
    subtitle: "Computer Networks",
    href: "/courses/computer-networks/reviews",
    icon: GlobeAltIcon,
  },
  {
    title: "CS-6035",
    subtitle: "Introduction to Information Security",
    href: "/courses/introduction-to-information-security/reviews",
    icon: LockClosedIcon,
  },
  {
    title: "CS-7646",
    subtitle: "Machine Learning for Trading",
    href: "/courses/machine-learning-for-trading/reviews",
    icon: CurrencyDollarIcon,
  },
  {
    title: "CS-6200",
    subtitle: "Introduction to Operating Systems",
    href: "/courses/graduate-introduction-to-operating-systems/reviews",
    icon: ChipIcon,
  },
];

const githubMenuItems = [
  {
    text: "Report a bug",
    href: "https://github.com/oms-tech/reviews/issues/new?assignees=m4ttsch&labels=bug&template=bug_report.md&title=[BUG REPORT]",
  },
  {
    text: "Request a feature",
    href: "https://github.com/oms-tech/reviews/issues/new?assignees=m4ttsch&labels=enhancement&template=feature_request.md&title=[FEATURE REQUEST]",
  },
  {
    text: "View code",
    href: "https://github.com/oms-tech/reviews",
  },
];

// headlessui.com/react/menu#integrating-with-next-js
const NextLinkWrapper: typeof Link = forwardRef((props, ref) => {
  const { href, children, ...rest } = props;
  return (
    <Link href={href} passHref>
      <a ref={ref} href="replace" {...rest}>
        {children}
      </a>
    </Link>
  );
});

NextLinkWrapper.displayName = "NextLinkWrapper";

export function Header(): JSX.Element {
  const router = useRouter();
  const [newReviewURL, setNewReviewURL] = useState<URL>();
  const [copiedContactInfo, setCopiedContactInfo] = useState<string>("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCopiedContactInfo("");
    }, 2000);

    return function cleanup() {
      clearTimeout(timeoutId);
    };
  }, [copiedContactInfo]);

  useEffect(() => {
    const url = new URL(`${window.location.origin}/reviews/new`);
    const { slug } = router.query;

    if (typeof slug === "string") {
      url.searchParams.append("course", slug);
    }

    setNewReviewURL(url);
  }, [router]);

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <Link href="/" passHref>
                  <a href="replace" className="flex-shrink-0 flex items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        // https://duncanleung.com/next-js-typescript-svg-any-module-declaration/
                        src={logo as string}
                        alt="OMS Tech Logo"
                        width={32}
                        height={32}
                        className="block"
                      />
                      <h1 className="text-lg">OMS Reviews</h1>
                    </div>
                  </a>
                </Link>
                <div className="hidden md:ml-6 md:flex justify-center gap-6">
                  <Link href="/" passHref>
                    <a
                      href="replace"
                      className={classNames(
                        {
                          "border-indigo-500 text-gray-900":
                            router.pathname === "/",
                          "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700":
                            router.pathname !== "/",
                        },
                        "inline-flex items-center px-1 pt-1 border-b-2"
                      )}
                    >
                      Home
                    </a>
                  </Link>
                  <Menu
                    as="div"
                    className="relative text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1"
                  >
                    {({ open: reviewMenuOpen }) => (
                      <>
                        <Menu.Button
                          className={classNames(
                            {
                              "text-gray-900": reviewMenuOpen,
                              "text-gray-500": !reviewMenuOpen,
                            },
                            "group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          )}
                        >
                          Reviews
                          <ChevronDownIcon
                            className={classNames(
                              reviewMenuOpen
                                ? "text-gray-600"
                                : "text-gray-400",
                              "ml-2 h-5 w-5 group-hover:text-gray-500"
                            )}
                            aria-hidden="true"
                          />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute origin-bottom-right top-full z-10 -ml-4 -mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
                            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                              <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                {reviewsMenuItems.map((item) => (
                                  <Menu.Item key={item.href}>
                                    <NextLinkWrapper
                                      href={item.href}
                                      key={item.href}
                                      className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                                    >
                                      <item.icon
                                        className="flex-shrink-0 h-6 w-6 text-indigo-600"
                                        aria-hidden="true"
                                      />
                                      <div className="ml-4">
                                        <p className="text-base font-medium text-gray-900">
                                          {item.title}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                          {item.subtitle}
                                        </p>
                                      </div>
                                    </NextLinkWrapper>
                                  </Menu.Item>
                                ))}
                              </div>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </>
                    )}
                  </Menu>
                  <a
                    href="https://omscs-notes.com"
                    className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1"
                  >
                    OMSCS Notes
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href={newReviewURL ?? "/"} passHref>
                    <a
                      href="replace"
                      className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusSmIcon
                        className="-ml-1 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      <span>Add Review</span>
                    </a>
                  </Link>
                </div>
                <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                  <Menu as="div" className="ml-3 relative">
                    <div className="flex">
                      <Menu.Button className="bg-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-gray-400 hover:text-gray-500 focus:text-gray-500">
                        <span className="sr-only">Open GitHub menu</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                        </svg>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="z-50 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {githubMenuItems.map(({ text, href }) => (
                          <Menu.Item key={href}>
                            {({ active }) => (
                              <a
                                href={href}
                                className={classNames(
                                  {
                                    "bg-gray-100": active,
                                  },
                                  "block px-4 py-2 text-gray-700"
                                )}
                              >
                                {text}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <NextLinkWrapper href="/" passHref>
                <Disclosure.Button
                  as="a"
                  href="#"
                  className={classNames({
                    "bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium sm:pl-5 sm:pr-6":
                      router.pathname === "/",
                    "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium sm:pl-5 sm:pr-6":
                      router.pathname !== "/",
                  })}
                >
                  Courses
                </Disclosure.Button>
              </NextLinkWrapper>
              <Disclosure.Button
                as="a"
                href="https://omscs-notes.com"
                className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium sm:pl-5 sm:pr-6"
              >
                OMSCS Notes
              </Disclosure.Button>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                {reviewsMenuItems.map((item) => (
                  <NextLinkWrapper href={item.href} key={item.href} passHref>
                    <Disclosure.Button
                      as="a"
                      className="p-3 flex items-start rounded-lg hover:bg-gray-50"
                    >
                      <item.icon
                        className="flex-shrink-0 h-6 w-6 text-indigo-600"
                        aria-hidden="true"
                      />
                      <div className="ml-4">
                        <p className="text-base font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.subtitle}
                        </p>
                      </div>
                    </Disclosure.Button>
                  </NextLinkWrapper>
                ))}
              </div>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                {githubMenuItems.map(({ text, href }) => (
                  <Disclosure.Button
                    as="a"
                    href={href}
                    key={href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 sm:px-6"
                  >
                    {text}
                  </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}