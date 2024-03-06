// ProductList.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useNavigation, useSearchParams } from "react-router-dom";
import Switch from "@mui/material/Switch";
import ProductCard from "./ProductCard.jsx";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { fetchProductList } from "./api.js";
import { useDebounce } from "use-debounce";
import Loading from "./components/Loading.jsx";

const ProductList = () => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isFreeDeliveryEnabled, setIsFreeDeliveryEnabled] = useState(
   ()=>searchParams.get('is-free') === 'true'
  );
  console.log(searchParams.get('is-free') === 'true');
  console.log(isFreeDeliveryEnabled);
  const [isBestSellerEnabled, setIsBestSellerEnabled] = useState(
    ()=>searchParams.get('is-best') === 'true'
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedValue = useDebounce(searchQuery, 500);
  const { ref, inView } = useInView();

  const location = useLocation()
  const navigation = useNavigation();
//
  console.log({location, navigation, searchParams}, searchParams.get('is-free'),searchParams.get('is-freedfd'));

  const handleQuery = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(()=>{
    setIsFreeDeliveryEnabled(searchParams.get('is-free') === 'true')
    setIsBestSellerEnabled(searchParams.get('is-best') === 'true')
  }, [location.search])

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    isSuccess,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      "key",
      isBestSellerEnabled,
      isFreeDeliveryEnabled,
      debouncedValue,
    ],
    queryFn: ({ pageParam }) =>
      fetchProductList({
        pageParam,
        isBestSellerEnabled,
        isFreeDeliveryEnabled,
        searchQuery,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return pages.length;
    },
  });

  const content = useMemo(() => {
    if (isSuccess) {
      return data.pages.flatMap((page, j) =>
        page.products.map((product, i) => {
          if (data.pages.length * page.products.length === (i + 1) * (1 + j)) {
            return <ProductCard ref={ref} product={product} key={product.id} />;
          }
          return <ProductCard product={product} />;
        })
      );
    }
    return null;
  }, [isSuccess, data, ref]);

  //old
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  //save scroll
  useEffect(() => {
    const storedScrollPosition = localStorage.getItem("scrollPosition");
    if (storedScrollPosition)
      window.scrollTo(0, parseInt(storedScrollPosition));

    const handleScroll = () =>
      localStorage.setItem("scrollPosition", window.scrollY.toString());
    window.addEventListener("scroll", handleScroll);
    // setIsBestSellerEnabled(
    //   JSON.parse(localStorage.getItem("isBestSellerEnabled"))
    // );
    // setIsFreeDeliveryEnabled(
    //   JSON.parse(localStorage.getItem("isFreeDeliveryEnabled"))
    // );
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  //save fillters
  // useEffect(() => {
  //   localStorage.setItem(
  //     "isBestSellerEnabled",
  //     JSON.stringify(isBestSellerEnabled)
  //   );
  //   localStorage.setItem(
  //     "isFreeDeliveryEnabled",
  //     JSON.stringify(isFreeDeliveryEnabled)
  //   );
  // }, [isBestSellerEnabled, isFreeDeliveryEnabled]);
  return (
    <div className="flex flex-col p-2 items-center w-full">
      <div className="flex flex-row gap-2 sticky top-0 bg-white py-2 bg-black w-full items-center justify-center">
        <div className="flex gap-2 border items-center w-[10rem]">
          <Switch
            checked={isFreeDeliveryEnabled}
            {...label}  
            onChange={(e) => {
              navigate(`${location.pathname}?is-free=${e.target.checked}&is-best=${searchParams.get('is-best')}`)
            }}
          />
          ارسال رایگان
        </div>
        <div className="flex  gap-2 border items-center w-[10rem]">
          <Switch
            {...label}
            checked={isBestSellerEnabled}
            onChange={(e) => {
              navigate(`${location.pathname}?is-free=${searchParams.get('is-free')}&is-best=${e.target.checked}`)
            }}
          />
          غرفه برتر
        </div>
        <input
          placeholder="دنبال چی هستی؟"
          className="border p-1 text-center"
          type="text"
          onChange={handleQuery}
        ></input>
        <Link to="/basket" className="btn">
          بریم سبد خرید
        </Link>
      </div>

      {content}
      {isFetchingNextPage && <Loading />}
      {isLoading && <Loading />}
      {error && <div className="text-red-500 my-20">{error.message}</div>}
    </div>
  );
};

export default ProductList;
