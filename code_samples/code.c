#include <linux/async.h>
#include <linux/atomic.h>
#include <linux/ktime.h>

static async_cookie_t next_cookie = 1;

#define MAX_WORK		32768
#define ASYNC_COOKIE_MAX	ULLONG_MAX	/* infinity cookie */

struct async_entry {
	struct list_head	domain_list;
	struct list_head	global_list;
	struct work_struct	work;
	async_cookie_t		cookie;
	async_func_t		func;
	void			*data;
	struct async_domain	*domain;
};

static DECLARE_WAIT_QUEUE_HEAD(async_done);

static atomic_t entry_count;

static async_cookie_t lowest_in_progress(struct async_domain *domain)
{
	struct list_head *pending;
	async_cookie_t ret = ASYNC_COOKIE_MAX;
	unsigned long flags;

	spin_lock_irqsave(&async_lock, flags);

	if (domain)
		pending = &domain->pending;
	else
		pending = &async_global_pending;

	if (!list_empty(pending))
		ret = list_first_entry(pending, struct async_entry,
				       domain_list)->cookie;

	spin_unlock_irqrestore(&async_lock, flags);
	return ret;
}
