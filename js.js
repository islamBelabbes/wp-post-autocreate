// form validation
const formvalidation = () => {
  const url = document.querySelector(".urlinput");
  const username = document.querySelector(".usernameinput");
  const password = document.querySelector(".passinput");
  const button = document.querySelector(".wp-api-checkbutton");
  [url, username, password].forEach((inputitem) => {
    inputitem.addEventListener("input", (e) => {
      if (url.value === "" || username.value === "" || password.value === "") {
        button.disabled = true;
        return;
      }
      button.disabled = false;
    });
  });
};
formvalidation();
// api functions //
const wp_api = (url, user, pass) => {
  const auhtapi = () => {
    const username = user;
    const appPassword = pass;
    const authHeader = "Basic " + btoa(username + ":" + appPassword);
    fetch(`${url}/wp-json/wp/v2/posts`, {
      headers: {
        Authorization: authHeader,
      },
    })
      .then((response) => {
        if (response.status === 200 && response.ok === true) {
          document.querySelector("#auth-check").classList.add("check-valid");
          document.querySelector(
            ".check-status"
          ).innerHTML += `<h1 class="" id="get-data">Getting Post Types Data...</h1>`;
          wp_posttypes();
        } else {
          document.querySelector("#auth-check").classList.add("check-failed");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // get wp post types //
  const wp_posttypes = () => {
    fetch(`${url}/wp-json/wp/v2/types`)
      .then((response) => response.json())
      .then((data) => {
        if (data.code === "rest_no_route") {
          document.querySelector("#get-data").classList.add("check-failed");
          return;
        }
        document.querySelector("#get-data").classList.add("check-valid");
        setTimeout(() => {
          document.querySelector(
            ".check-status"
          ).innerHTML += `  <h1 class="Check complete" id="check-complete">
          Check complete... please wait
          <i class="fas fa-spinner fa-spin"></i>
        </h1>`;
          setTimeout(() => {
            document.querySelector(".wp-api-check").remove();
            main_maker(data);
          }, 3000);
        }, 500);
      })
      .catch((error) => {
        document.querySelector("#get-data").classList.add("check-failed");
        // console.error(error);
      });
  };
  auhtapi();
};
// on submit //
const formsubmit = () => {
  const form = document.querySelector("#wp-api-check-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.querySelector(".wp-api-checkbutton").disabled = true;
    // creata obj from form submit //
    const formDataObj = {};
    for (const [name, value] of new FormData(form)) {
      formDataObj[name] = value;
    }
    document.querySelector(
      ".check-status"
    ).innerHTML = `<h1 class="" id="auth-check">Cheking your Auth...</h1>`;
    localStorage.setItem("auth-check", btoa(JSON.stringify(formDataObj)));
    wp_api(
      formDataObj["wp-api-url"],
      formDataObj["wp-api-username"],
      formDataObj["wp-api-password"]
    );
  });
};
formsubmit();
const main_maker = (data) => {
  const template = document.querySelector("[data-main-form]");
  const mainform = template.content.cloneNode(true).children;
  const dataoptions = Object.keys(data).map((item) => {
    return `<option value="${item}">${item}</option>`;
  });
  mainform[0].querySelector("select").innerHTML = dataoptions.join("");
  [...mainform].forEach((currentItem) => {
    document.querySelector(".wp-randomizer-main").appendChild(currentItem);
  });
  // range //
  const range = document.querySelector(".range-slider__range");
  range.addEventListener("input", (e) => {
    document.querySelector(".range-slider__value").innerHTML = e.target.value;
  });
  document.querySelector(".range-slider__value").innerHTML = range.value;
  const post_data = async (posttype, count, length) => {
    const local = localStorage.getItem("auth-check");
    const url = JSON.parse(atob(local))["wp-api-url"];
    const username = JSON.parse(atob(local))["wp-api-username"];
    const password = JSON.parse(atob(local))["wp-api-password"];
    try {
      for (let i = 0; i < count; i++) {
        const creating = document.createElement("h1");
        creating.innerHTML = `Creating ${
          posttype === "posts" ? "post" : posttype
        } ....`;
        document.querySelector(".data-posts").appendChild(creating);
        // get random image //
        // get random image //
        const img = `https://picsum.photos/200/300?random=${Math.floor(
          Math.random() * 1000
        )}`;

        // upload image to WordPress //
        const formData = new FormData();
        formData.append(
          "file",
          await fetch(img).then((res) => res.blob()),
          `img${i}.jpg`
        );
        const responseMedia = await fetch(`${url}/wp-json/wp/v2/media`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
          body: formData,
        });
        const dataMedia = await responseMedia.json();
        // get random content //
        const response = await fetch(
          `https://asdfast.beobit.net/api/?length=${length}&type=paragraph&cache=${Math.random()}`
        );
        let data = await response.json();

        // create new post //
        const post = {
          title: data.text.slice(0, Math.floor(data.text.length * 0.01)),
          content: data.text,
          status: "publish",
          categories: [1], // replace with category ID of your choice
          featured_media: dataMedia.id, // replace with media ID of your choice
        };
        const responsepost = await fetch(`${url}/wp-json/wp/v2/${posttype}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
          body: JSON.stringify(post),
        });
        const datapost = await responsepost.json();
        if (datapost.code === "rest_no_route") {
          creating.textContent = "there was an error creating";
        } else {
          creating.setAttribute("data-post-id", datapost.id);
          creating.textContent = `${
            posttype === "posts" ? "post" : posttype
          } Has Been Created`;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      document.querySelector(".btncreateposts").disabled = false;
      document.querySelector(
        ".data-posts"
      ).innerHTML += `<h1 class="created-done">AUTO Posting Has been Done</h1>`;
    } catch (error) {
      console.log(error);
      creating.setAttribute("data-post-Failed", "");
      creating.textContent = `${
        posttype === "posts" ? "post" : posttype
      } Create Failed`;
    }
  };
  // post maker submit  //
  const post_maker = () => {
    const postmakerform = document.querySelector(".wp-randomizer-main");
    postmakerform.addEventListener("submit", (e) => {
      e.preventDefault();
      document.querySelector(".data-posts").innerHTML = "";
      document.querySelector(".btncreateposts").disabled = true;
      const formDataObj = {};
      for (const [name, value] of new FormData(postmakerform)) {
        formDataObj[name] = value;
      }
      if (formDataObj["posttype"] === "post") {
        formDataObj["posttype"] = "posts";
      }
      post_data(
        formDataObj["posttype"],
        parseInt(formDataObj["postcount"]),
        parseInt(formDataObj["postlenght"])
      );
    });
  };
  post_maker();
};
