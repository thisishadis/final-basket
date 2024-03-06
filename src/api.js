import axios from "axios";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
const basalamApiToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMSIsImp0aSI6ImU0MTJlNzE0OGFkOGNmMmU4YjgwYjUyNDZmMWVlNTEzMjBjZjM5YWE3NzZlMDlmZDYwZTUzYjM4M2E2NTQ3YmQ0OTU3YWY5OTNkZmI3NGFiIiwiaWF0IjoxNzA1MzIwNzQ0LjA3Mjk4MywibmJmIjoxNzA1MzIwNzQ0LjA3Mjk4OCwiZXhwIjoxNzM2OTQzMTQ0LjA1MDg0Mywic3ViIjoiMTMxNjYzMTEiLCJzY29wZXMiOltdLCJ1c2VyX2lkIjoxMzE2NjMxMX0.HrQlsuod1BsfsHy_ML5reebKHdCsZD8SPhNnAYuZm8MgeXhyrAOHuhN45TdDAiXTT4s5Jqye2A1bc4OBdiq3-zGDKMj5tULGvLRZY02lVl-D55Vs_1KCxkGTcwMW_Blf7sAIrNgZVkMEIheB9GwfdS7H5s4P7LOlKzBtZVDymxWbiJDwAB4o0pjYb5XMzFsnGeIkPrfJcLvdOsKO-eEJG_KMVmcfk2Fu-NETUI0LOjs7CLZYJd96VbAO4JPfunsqBUUGFcV4WYd3ymAveK4u71kdj1Y0d_o-CNRWCCn8J92ROOPtsI7Ro3SQcI5z47SEnHh2K4ghNLS87lhycFMfI12ZR1fvuRRnEXBhVTWNMOdKQlD7flvMRWUJJE8-Os9ALz4Q_n87qVDr1HWUdau2KYApwxZuWo9VPXNTiUW6Y4I-V49C-KE3I9rYxORr_BRj5YmbvxPISKQNxK-HLN3KZiJGl3N8uZXRjqXZQTbgn7FyVicn_DoW6XyhU3j37h76LDQaLpbF3ICHJKhrKo10g-4um2ouKIJGeo5kPD5EQOs0Fkm4__NZjuK90U1a1V09fK-kGmDx6p2qgCru3OBK4YcEzQLmzU7lzWM_oHpwNSaUOxgROaocMGOrl2M7TaU8ol0kMnD--s9Ogt9PU1O_BMD_ziOwsUTpXoHX4QKQtho";
axios.defaults.headers.common["Authorization"] = `Bearer ${basalamApiToken}`;
const SIZE = 48;

export const useAddMutation = () => {
  return useMutation({
    mutationFn: ({ quantity, product_id, variation_id }) => {
      return axios.post("https://order.basalam.com/basket/item?light=true", {
        quantity,
        product_id,
        variation_id,
      });
    },
    // onSuccess: () => {
    //   document.getElementById("my_modal_3").showModal();
    // },
  });
};

export const deleteFromBasket = async (product) => {
  try {
    const response = await axios.post(
      "https://order.basalam.com/basket/item?light=false",
      {
        product_id: product?.id,
        quantity: -1,
        variation_id: null,
      }
    );
  } catch (error) {
    console.error("Main Delete Request Error:", error);
  }
};

export const fetchProductList = async ({
  pageParam,
  isBestSellerEnabled,
  isFreeDeliveryEnabled,
  searchQuery,
}) => {
  try {
    const response = await axios.get(
      "https://search.basalam.com/ai-engine/api/v2.0/product/search",
      {
        params: {
          from: pageParam * SIZE,
          "f.vendorScore": isBestSellerEnabled,
          "f.freeShipping": isFreeDeliveryEnabled,
          "filters.slug": "handmade-leather-accessory",
          dynamicFacets: true,
          size: SIZE,
          adsImpressionDisable: false,
          userCityId: 1722,
          q: searchQuery,
        },
      }
    );
    if (response.status === 204 || response.status === 422) {
      // Returning an object with an empty array for a 204 response
      return { products: [] };
    }
    if (response.data && response.data.products.length > 0) {
      return response.data;
    } else {
      throw new Error("چیزی که دنبالشی رو هنوز نساختن");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const deleteItem = (itemId) => {
  axios
    .delete(`https://order.basalam.com/basket/item/${itemId}`)
    .then((response) => {
    })
    .catch((error) => {
    });
};

export const incrementInBasket = async (product) => {
  try {
    const response = await axios.post(
      "https://order.basalam.com/basket/item?light=false",
      {
        product_id: product?.id,
        // quantity: product?.quantity,
        quantity: 1,
        variation_id: null,
      }
    );
  } catch (error) {
    if (error.response && error.response.status === 422) {
      alert("تموم کردیم اینو. بعدا بیا.");
    }
  }
};

export const addToBasket = async (product) => {
  try {
    const payload = {
      quantity: 1,
      product_id: product.id,
      variation_id: null,
    };

    const response = await axios.post(
      "https://order.basalam.com/basket/item?light=true",
      payload
    );
    document.getElementById("my_modal_3").showModal();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Handle the specific case where the item is not available
      alert("متاسفانه این کالا در حال حاضر موجود نمی‌باشد.");
    } else {
      console.error("Error adding item to basket:", error.message);
    }
  }
};