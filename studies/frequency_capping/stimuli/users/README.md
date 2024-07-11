Running the script `../scripts/00_user_generator.qmd` I read `users_in.csv` and the corresponding `user_image` column. 
That column provides many images I copied from [unsplash.com](https://unsplash.com/).
Because I am concerned about performance, I convert all these images to `*.webp` files, store them on github and replace the original url with the new github url.

To avoid any confusion, I use the unsplash IDs as file names. 
Hence, this unsplash image https://images.unsplash.com/photo-1595211877493-41a4e5f236b3
can also be found in my github repository: https://raw.githubusercontent.com/Howquez/oFeeds/main/studies/frequency_capping/stimuli/users/webp/photo-1595211877493-41a4e5f236b3.webp