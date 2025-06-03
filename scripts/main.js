document.addEventListener('DOMContentLoaded', () => {
    // Handle paper filters
    const paperFilters = document.querySelectorAll('.paper-filters .filter-btn');
    const paperItems = document.querySelectorAll('.paper-item');

    paperFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            paperFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');

            const filterValue = filter.getAttribute('data-filter');

            paperItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Handle project filters
    const projectFilters = document.querySelectorAll('.project-filters .filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    projectFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            projectFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');

            const filterValue = filter.getAttribute('data-filter');

            projectItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                    item.style.display = 'block';
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Handle lecture filters
    const lectureFilters = document.querySelectorAll('.lecture-filters .filter-btn');
    const lectureItems = document.querySelectorAll('.lecture-item');

    lectureFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            lectureFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');

            const filterValue = filter.getAttribute('data-filter');

            lectureItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Create necessary directories
    const directories = ['papers', 'videos', 'materials', 'images'];
    directories.forEach(dir => {
        try {
            if (!window.fs) return; // Skip if not in Node.js environment
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        } catch (error) {
            console.log(`Note: Directory '${dir}' could not be created in browser environment`);
        }
    });
}); 