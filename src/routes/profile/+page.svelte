<script>
  import UserInfo from '$components/UserInfo.svelte'
  import CallToAction from '$components/CallToAction.svelte'
  import Rating from '$components/Rating.svelte'
  import Map from '$components/Map.svelte'

  export let data;

  const teacher = data.teachers?.[0] || {};
  const ratings = data.ratings || [];

  console.log(data)

  const userInfoProps = {
    name: teacher.name,
    teacher_info: teacher.teacher_info, 
    countryFlag: teacher.country_flag,
    subjectText: teacher.teaches_in ? `Teaches in ${teacher.teaches_in}` : 'Teaches',
    profile_image_url: teacher.profile_image_url,
    location: teacher.location,
    gallery_image_urls: teacher.gallery_image_urls,
    tags: teacher.tags
  };

  // const callToActionProps = {
  //   name: teacher.name,
  //   youtube_url: teacher.youtube_url || '',
  //   product_url: data.products?.[0]?.url || '',
  //   products: data.products
  // };

  function parseLocation(location) {
    if (location) {
      const parts = location.split(',');
      if (parts.length === 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lng) && !isNaN(lat)) {
          return [lng, lat];
        }
      }
    }
    return null;
  }

</script>

<div class="flex flex-wrap gap-8 container mx-auto pt-20">
  <div class="flex flex-col gap-8">
    <UserInfo {...userInfoProps} />
    <Rating ratings={ratings} />
  </div>
  <CallToAction /> 
  <div style="height: 400px; width: 100%;">
    <Map teachers={[teacher]} />
  </div>
</div>