const { URL } = require('url');
const TopicsController  = require("./topicsController");
const TopicMaterial = require('../models/topicMaterialModel');
const { TopicModel, TopicMaterialModel } = require('../models');


const processDriveLink = (link) => {


  if (link.includes('<iframe') && link.includes('https://drive.google.com')) {
    const srcRegex = /src="(.*?)"/;
    const match = link.match(srcRegex);
    if (match && match[1]) {
      const iframeSrc = match[1]; // Access the URL string from match[1]
      return { success: true, data: iframeSrc};
    } else {
      // If no src attribute found, return an error
      return { success: false, error: 'Invalid YouTube video link' };
    }
  }


    if(!link.includes('https://drive.google.com')){
      return { success: false, error: 'Invalid Google Drive link' };
    }
    // Check if the link contains "/view" at the end and replace it with "/preview"
    const processedLink = link.replace(/\/view$/, '/preview');
  
    // Check if the link is a valid URL
    try {
      const urlObject = new URL(processedLink);
      // If the URL is valid, return the processed link
      return { success: true, data: urlObject.href };
    } catch (error) {
      // If the URL is not valid, return an error message
      return { success: false, error: 'Invalid Google Drive link' };
    }
  };

const processYoutubeLink = (videoLink) => {

  
    if (videoLink.includes('<iframe') && videoLink.includes('https://www.youtube.com')) {
        const srcRegex = /src="(.*?)"/;
        const match = videoLink.match(srcRegex);
        if (match && match[1]) {
          const iframeSrc = match[1]; // Access the URL string from match[1]
          return { success: true, data: iframeSrc};
        } else {
          // If no src attribute found, return an error
          return { success: false, error: 'Invalid YouTube video link' };
        }
      }
      
      if(!videoLink.includes('https://www.youtube.com')){
    
        return { success: false, error: 'Invalid YouTube video link' };
      }

      if(videoLink.includes('/embed/')){
        const regex = /\/embed\/([^/?]+)/;
        const match = videoLink.match(regex);
        
        if (match && match[1]) {
          const videoId = match[1];
          return { success: true, data: videoLink  };
        } else {
          return { success: false, error: 'Invalid YouTube video link' };
        }
        
      }
    // Check if the video link contains a query parameter 'v'
    const videoIdMatch = videoLink.match(/[?&]v=([^&]+)/);  
    if (videoIdMatch) {
      const embedLink = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      return { success: true, data: embedLink };
      
    } else {
      // If the video link format is different, you can implement additional logic here
      throw new Error('Invalid YouTube video link');
    }
  };

  const processVimeoLink = (linkOrIframe) => {
    // Check if the link contains "player.vimeo.com/video/" and extract the video id
 
  
    // Check if the input is an iframe, extract the link from the src attribute
    if (linkOrIframe.includes('<iframe')) {
      const iframeSrcRegex = /src=["'](.*?)["']/;
      const match = linkOrIframe.match(iframeSrcRegex);
      if (match && match[1]) {
        linkOrIframe = match[1];
        return { success: true, data: linkOrIframe };
      } else {
        // If no src attribute found, return an error
        return { success: false, error: 'Invalid Vimeo iframe' };
      }
    }
    const vimeoRegex1 = /player\.vimeo\.com\/video\/(\d+)/;
    const matchPlayer = linkOrIframe.match(vimeoRegex1);
    if (matchPlayer && matchPlayer[1]) {
      const videoId = matchPlayer[1];
      const embedLink = `https://player.vimeo.com/video/${videoId}`;
      return { success: true, data: embedLink };
    }

    // Check if the link contains "vimeo.com" and extract the video id
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const match = linkOrIframe.match(vimeoRegex);
    if (match && match[1]) {
      const videoId = match[1];
      const embedLink = `https://player.vimeo.com/video/${videoId}`;
      return { success: true, data: embedLink };
    }
  
    // If the link format is invalid, return an error
    return { success: false, error: 'Invalid Vimeo link' };
  };
  


  module.exports.processVideoLink = (videoSource, videoLink) => {
    try {
      if (videoSource === 'youtube') {
        const embedLinkResult = processYoutubeLink(videoLink);
        if (embedLinkResult.success) {
          return { success: true, data: embedLinkResult.data };
        }else{
          return { success: false, error: embedLinkResult.error };
        }
        
      } else if (videoSource === 'googledrive') {
        const embedLinkResult = processDriveLink(videoLink);
        if (embedLinkResult.success) {
          return { success: true, data: embedLinkResult.data };
        } else {
          return { success: false, error: embedLinkResult.error };
        }
      } else if (videoSource === 'vimeo') {
        // Add Vimeo video processing logic
        const embedLinkResult = processVimeoLink(videoLink);
        if (embedLinkResult.success) {
          return { success: true, data: embedLinkResult.data };
        } else {
          return { success: false, error: embedLinkResult.error };
        }
      }
      
      // If videoSource is not recognized, return an error message
      return { success: false, error: 'Invalid video source' };
    } catch (error) {
      // Handle any other unexpected errors and return an error message
      return { success: false, error: 'An error occurred while processing the video link' };
    }
  };


  module.exports.previewTopic = async (req,res) =>{
      try {
        const topicId = req.params.topicId;
        // Fetch the topic material data based on the topicId
        const topicMaterial = await TopicMaterialModel.findOne({ topicId });
        
        // Fetch the topic
        const topic = await TopicModel.findById(topicId);
        //console.log(topic);
        if (!topicMaterial) {
          // Handle case where topic material is not found
          return res.status(404).send('Topic material not found');
        }
       
        // Pass the topic material data to the course outline view for rendering
        if(topicMaterial.topicVideo){
          topicMaterial.embedLink = topicMaterial.topicVideo;
        }
 
   
        const topics = await TopicsController.getCourseTopicsByTopic(topicId);
        const admin  = req.user.isAdmin;
      
        res.render('topic/preview', { topicMaterial ,topic,topics,admin});
      } catch (error) {
        console.error('Error retrieving topic material:', error);
        return res.render('404',{message:"An error occurred while retrieving"});
      }
  }
  
  
  
  
  
  
  