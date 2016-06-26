API calls
=========

This section documents the calls made to the WFP mVAM API.  All calls come from (from table pblStatsSum) and use the paging as described in :doc:`structure`

For getting the regional values (example here Ad Dali in Yemen):

* ADM0_NAME = 'Yemen' AND AdminStrata = 'Ad Dali' AND IndpVars = 'AdminUnits'

For getting the whole country values (example here for Yemen)

* ADM0_NAME = 'Yemen' AND AdminStrata = 'Ad Dali' AND IndpVars = 'Yemen' 